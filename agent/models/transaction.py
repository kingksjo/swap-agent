from pydantic import BaseModel, field_validator
import re

class SwapProposal(BaseModel):
    action: str = "swap"
    tokenIn: str
    tokenOut: str
    amount: str  # Kept as string to preserve precision
    maxSlippage: str
    chain: str = "base"

class SendProposal(BaseModel):
    action: str = "send"
    token: str
    toAddress: str
    amount: str
    chain: str = "base"

    @field_validator('toAddress')
    @classmethod
    def validate_address(cls, v: str) -> str:
        # Strictly enforce 0x + 40 hex characters
        if not re.match(r"^0x[a-fA-F0-9]{40}$", v):
            raise ValueError(f"Invalid Ethereum address: {v}. Must start with 0x followed by 40 hex characters.")
        return v