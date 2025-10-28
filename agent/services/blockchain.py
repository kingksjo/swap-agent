"""Blockchain service layer for all web3.py interactions.

This module exposes a `BlockchainService` class that encapsulates
common blockchain operations used by higher-level tools. By centralising
all `web3.py` logic here we gain:

1.  A single place to manage provider connections and middleware
2.  Easier unit testing via dependency injection
3.  Clear separation between low level RPC calls and the agent logic

The service is intentionally focused on the requirements for a
non-custodial "Send" feature, but is designed to be extended for future
tools (swap quotes, approvals, etc.).
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict, Optional

from web3 import Web3
from web3.exceptions import ContractLogicError
from web3.middleware import ExtraDataToPOAMiddleware

from agent.core import settings


# Networks that require the POA middleware (extraData field > 32 bytes)
POA_NETWORK_KEYWORDS = ("sepolia", "amoy", "bnb", "base", "optimism", "arb" )


@dataclass(slots=True)
class FeeParams:
    """Represents gas fee parameters for a transaction."""

    gas_limit: int
    gas_price: Optional[int] = None
    max_fee_per_gas: Optional[int] = None
    max_priority_fee_per_gas: Optional[int] = None


class BlockchainService:
    """Helper around `web3.py` for preparing transactions."""

    def __init__(
        self,
        network: Optional[str] = None,
        *,
        rpc_url: Optional[str] = None,
    ) -> None:
        self.network = network or settings.default_network
        self.rpc_url = rpc_url or settings.rpc_urls.get(self.network)
        if not self.rpc_url:
            raise ValueError(
                f"RPC URL for network '{self.network}' is not configured. "
                "Ensure the environment contains the appropriate RPC setting."
            )

        try:
            self.web3 = Web3(Web3.HTTPProvider(self.rpc_url, request_kwargs={"timeout": 30}))
            self._apply_optional_middlewares()

            # Test connection
            if not self.web3.is_connected():
                raise ConnectionError(f"Failed to connect to RPC endpoint: {self.rpc_url}")
            
            # Determine once whether this network supports EIP-1559 style fees
            self._supports_eip1559 = self._detect_eip1559_support()
            
        except Exception as e:
            raise ValueError(
                f"Blockchain service initialization failed for network '{self.network}': {str(e)}"
            ) from e

    # ------------------------------------------------------------------
    # Connection helpers
    # ------------------------------------------------------------------
    def _apply_optional_middlewares(self) -> None:
        """Apply middleware required for certain networks (e.g., POA chains)."""

        for keyword in POA_NETWORK_KEYWORDS:
            if keyword in self.rpc_url.lower():
                # ExtraDataToPOAMiddleware is compatible with Base/Optimism/Polygon/BNB
                self.web3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
                break

    def _detect_eip1559_support(self) -> bool:
        """Return True if the connected chain supports EIP-1559 style fees."""

        try:
            self.web3.eth.fee_history(1, "latest")
            return True
        except Exception:
            return False

    # ------------------------------------------------------------------
    # Public helpers
    # ------------------------------------------------------------------
    @property
    def chain_id(self) -> int:
        return self.web3.eth.chain_id

    def get_nonce(self, address: str) -> int:
        return self.web3.eth.get_transaction_count(Web3.to_checksum_address(address))

    # ------------------------------------------------------------------
    # Token metadata helpers
    # ------------------------------------------------------------------
    def get_token_decimals(self, token_address: str) -> int:
        contract = self._get_erc20_contract(token_address)
        return contract.functions.decimals().call()

    def get_token_symbol(self, token_address: str) -> str:
        contract = self._get_erc20_contract(token_address)
        try:
            # Some tokens store symbol() as bytes32, so decode defensively
            symbol = contract.functions.symbol().call()
            return symbol.decode("utf-8").rstrip("\x00") if isinstance(symbol, bytes) else str(symbol)
        except ContractLogicError:
            return "UNKNOWN"

    # ------------------------------------------------------------------
    # Transaction builders
    # ------------------------------------------------------------------
    def build_native_transfer(
        self,
        sender: str,
        recipient: str,
        amount_wei: int,
        *,
        gas_limit: Optional[int] = None,
        fee_overrides: Optional[Dict[str, int]] = None,
    ) -> Dict[str, Any]:
        """Construct a native currency transfer transaction."""

        checksum_sender = Web3.to_checksum_address(sender)
        checksum_recipient = Web3.to_checksum_address(recipient)

        base_tx: Dict[str, Any] = {
            "from": checksum_sender,
            "to": checksum_recipient,
            "value": amount_wei,
            "nonce": self.get_nonce(checksum_sender),
            "chainId": self.chain_id,
            "type": 2 if self._supports_eip1559 else 0,
        }

        if gas_limit is None:
            estimated_gas = self.web3.eth.estimate_gas({
                "from": checksum_sender,
                "to": checksum_recipient,
                "value": amount_wei,
            })
        else:
            estimated_gas = gas_limit

        fee_params = self._build_fee_params(estimated_gas, fee_overrides)
        base_tx.update(self._fee_dict(fee_params))
        base_tx["gas"] = fee_params.gas_limit

        return base_tx

    def build_erc20_transfer(
        self,
        token_address: str,
        sender: str,
        recipient: str,
        amount_base_units: int,
        *,
        gas_limit: Optional[int] = None,
        fee_overrides: Optional[Dict[str, int]] = None,
    ) -> Dict[str, Any]:
        """Construct an ERC20 transfer transaction."""

        checksum_sender = Web3.to_checksum_address(sender)
        checksum_token = Web3.to_checksum_address(token_address)
        checksum_recipient = Web3.to_checksum_address(recipient)

        contract = self._get_erc20_contract(checksum_token)
        tx_function = contract.functions.transfer(checksum_recipient, amount_base_units)

        base_tx: Dict[str, Any] = {
            "from": checksum_sender,
            "nonce": self.get_nonce(checksum_sender),
            "chainId": self.chain_id,
            "type": 2 if self._supports_eip1559 else 0,
        }

        if gas_limit is None:
            # Provide minimal args for estimation
            estimation_tx = tx_function.build_transaction({"from": checksum_sender})
            estimated_gas = self.web3.eth.estimate_gas(estimation_tx)
        else:
            estimated_gas = gas_limit

        fee_params = self._build_fee_params(estimated_gas, fee_overrides)
        tx: Dict[str, Any] = tx_function.build_transaction({
            "from": checksum_sender,
            "nonce": base_tx["nonce"],
            "chainId": base_tx["chainId"],
            **self._fee_dict(fee_params),
        })

        tx["gas"] = fee_params.gas_limit
        return tx

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _build_fee_params(
        self,
        gas_limit: int,
        fee_overrides: Optional[Dict[str, int]] = None,
    ) -> FeeParams:
        fee_overrides = fee_overrides or {}

        if self._supports_eip1559:
            max_priority = fee_overrides.get("maxPriorityFeePerGas")
            max_fee = fee_overrides.get("maxFeePerGas")

            if max_priority is None:
                max_priority = int(self.web3.eth.max_priority_fee)

            if max_fee is None:
                latest_block = self.web3.eth.get_block("latest")
                base_fee = latest_block.get("baseFeePerGas")
                if base_fee is None:
                    raise ValueError("Connected network reports EIP-1559 support but no baseFeePerGas.")
                max_fee = int(base_fee + max_priority * 2)

            return FeeParams(
                gas_limit=gas_limit,
                max_priority_fee_per_gas=int(max_priority),
                max_fee_per_gas=int(max_fee),
            )

        gas_price = fee_overrides.get("gasPrice")
        if gas_price is None:
            gas_price = int(self.web3.eth.gas_price)

        return FeeParams(gas_limit=gas_limit, gas_price=int(gas_price))

    def _fee_dict(self, fee_params: FeeParams) -> Dict[str, int]:
        if fee_params.max_fee_per_gas is not None:
            return {
                "maxFeePerGas": fee_params.max_fee_per_gas,
                "maxPriorityFeePerGas": fee_params.max_priority_fee_per_gas or 0,
            }
        return {"gasPrice": fee_params.gas_price or 0}

    def _get_erc20_contract(self, token_address: str):
        abi_def = settings.erc20_abi
        if isinstance(abi_def, str):
            abi = json.loads(abi_def)
        else:
            abi = abi_def
        return self.web3.eth.contract(address=Web3.to_checksum_address(token_address), abi=abi)


__all__ = ["BlockchainService", "FeeParams"]

