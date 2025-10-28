"""High-level Send tool that prepares unsigned transactions for users.

This module provides the business logic for the "Send" feature. It is
responsible for:

1.  Validating user-provided parameters
2.  Determining whether the request targets the native token or an ERC20
3.  Leveraging :class:`agent.services.blockchain.BlockchainService` to
    build an unsigned transaction
4.  Returning a human-readable summary and machine-readable payload that
    the frontend can present to the user for signature

All calls are non-custodial; the resulting transaction dictionary is
unsigned and intended for the user's wallet to sign.
"""

from __future__ import annotations

from decimal import Decimal, getcontext
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, field_validator
from web3 import Web3

from agent.core import settings
from agent.services.blockchain import BlockchainService


getcontext().prec = 78  # sufficient precision for 256-bit arithmetic


NATIVE_TOKEN_BY_NETWORK = {
    "base_mainnet": "ETH",
    "base_sepolia": "ETH",
    "ethereum_mainnet": "ETH",
    "ethereum_sepolia": "ETH",
    "optimism_mainnet": "ETH",
    "optimism_sepolia": "ETH",
    "polygon_mainnet": "MATIC",
    "polygon_amoy": "MATIC",
    "bnb_mainnet": "BNB",
    "bnb_testnet": "tBNB",
}


class SendRequest(BaseModel):
    sender_address: str = Field(..., description="User-controlled wallet address")
    recipient_address: str = Field(..., description="Destination wallet address")
    amount: Decimal = Field(..., gt=Decimal("0"))
    token_symbol: str = Field(default="ETH", description="Token symbol (native or ERC20)")
    network: Optional[str] = Field(default=None, description="Optional network override")

    @field_validator("sender_address", "recipient_address")
    @classmethod
    def validate_address(cls, value: str) -> str:
        if not Web3.is_address(value):
            raise ValueError(f"Invalid EVM address provided: {value}")
        return Web3.to_checksum_address(value)

    @field_validator("token_symbol")
    @classmethod
    def normalise_symbol(cls, value: str) -> str:
        if not value:
            raise ValueError("Token symbol cannot be blank")
        return value.upper()


class SendResult(BaseModel):
    summary: str
    network: str
    token_symbol: str
    amount: Decimal
    amount_base_units: int
    transaction: Dict[str, Any]
    sender_address: str
    recipient_address: str
    fee_info: Dict[str, Optional[int]]


class SendTool:
    """Facade used by the agent graph to prepare send transactions."""

    def __init__(self, service_factory=None) -> None:
        self._service_factory = service_factory or (lambda network: BlockchainService(network=network))

    def prepare_transaction(self, payload: SendRequest) -> SendResult:
        data = payload.model_copy()
        network = data.network or settings.default_network

        service = self._service_factory(network)
        token_symbol = data.token_symbol
        sender = data.sender_address
        recipient = data.recipient_address

        is_native = self._is_native_token(network, token_symbol)

        if is_native:
            amount_wei = self._native_to_wei(service, data.amount)
            unsigned_tx = service.build_native_transfer(
                sender=sender,
                recipient=recipient,
                amount_wei=amount_wei,
            )
            fee_info = self._extract_fee_info(unsigned_tx)
            summary = self._build_summary(
                token_symbol=token_symbol,
                amount=data.amount,
                network=network,
                sender=sender,
                recipient=recipient,
                fee_info=fee_info,
            )
            return SendResult(
                summary=summary,
                network=network,
                token_symbol=token_symbol,
                amount=data.amount,
                amount_base_units=amount_wei,
                transaction=unsigned_tx,
                sender_address=sender,
                recipient_address=recipient,
                fee_info=fee_info,
            )

        token_address = self._resolve_token_contract(network, token_symbol)
        decimals = service.get_token_decimals(token_address)
        amount_base_units = self._erc20_to_base_units(data.amount, decimals)
        unsigned_tx = service.build_erc20_transfer(
            token_address=token_address,
            sender=sender,
            recipient=recipient,
            amount_base_units=amount_base_units,
        )
        fee_info = self._extract_fee_info(unsigned_tx)
        summary = self._build_summary(
            token_symbol=token_symbol,
            amount=data.amount,
            network=network,
            sender=sender,
            recipient=recipient,
            fee_info=fee_info,
        )
        return SendResult(
            summary=summary,
            network=network,
            token_symbol=token_symbol,
            amount=data.amount,
            amount_base_units=amount_base_units,
            transaction=unsigned_tx,
            sender_address=sender,
            recipient_address=recipient,
            fee_info=fee_info,
        )

    # ------------------------------------------------------------------
    # Helper methods
    # ------------------------------------------------------------------
    def _native_to_wei(self, service: BlockchainService, amount: Decimal) -> int:
        return int(service.web3.to_wei(str(amount), "ether"))

    def _erc20_to_base_units(self, amount: Decimal, decimals: int) -> int:
        base_multiplier = Decimal(10) ** Decimal(decimals)
        base_units = amount * base_multiplier
        return int(base_units.quantize(Decimal("1")))

    def _is_native_token(self, network: str, symbol: str) -> bool:
        native = NATIVE_TOKEN_BY_NETWORK.get(network)
        if native is None:
            return symbol == "ETH"
        return symbol == native or (symbol == "ETH" and native == "ETH")

    def _resolve_token_contract(self, network: str, symbol: str) -> str:
        try:
            return settings.token_contracts[network][symbol]
        except KeyError as exc:
            raise ValueError(
                f"Token '{symbol}' is not configured for network '{network}'."
            ) from exc

    def _extract_fee_info(self, tx: Dict[str, Any]) -> Dict[str, Optional[int]]:
        return {
            "gas_limit": tx.get("gas"),
            "max_fee_per_gas": tx.get("maxFeePerGas"),
            "max_priority_fee_per_gas": tx.get("maxPriorityFeePerGas"),
            "gas_price": tx.get("gasPrice"),
        }

    def _build_summary(
        self,
        *,
        token_symbol: str,
        amount: Decimal,
        network: str,
        sender: str,
        recipient: str,
        fee_info: Dict[str, Optional[int]],
    ) -> str:
        gas_limit = fee_info.get("gas_limit") or 0
        max_fee = fee_info.get("max_fee_per_gas")
        max_priority = fee_info.get("max_priority_fee_per_gas")
        legacy_gas_price = fee_info.get("gas_price")

        if max_fee is not None:
            gas_price_gwei = Decimal(max_fee) / Decimal(10**9)
            priority_gwei = (
                Decimal(max_priority or 0) / Decimal(10**9)
                if max_priority is not None
                else Decimal("0")
            )
            fee_line = (
                f"Max fee per gas: {gas_price_gwei.normalize()} GWEI (priority tip: {priority_gwei.normalize()} GWEI)"
            )
        else:
            gas_price_gwei = Decimal(legacy_gas_price or 0) / Decimal(10**9)
            fee_line = f"Gas price: {gas_price_gwei.normalize()} GWEI"

        lines = [
            "Prepared transaction estimate:",
            f"- Network: {network}",
            f"- Sender: {sender}",
            f"- Recipient: {recipient}",
            f"- Token: {token_symbol}",
            f"- Amount: {amount.normalize()}",
            f"- Estimated gas limit: {gas_limit}",
            f"- {fee_line}",
        ]

        return "\n".join(lines)


__all__ = [
    "SendTool",
    "SendRequest",
    "SendResult",
]

