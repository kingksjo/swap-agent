from pydantic import BaseModel
from typing import Union, Optional
from .transaction import SwapProposal, SendProposal

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_address: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    proposed_transaction: Optional[Union[SwapProposal, SendProposal]] = None
    quote_data: Optional[dict] = None
    conversation_id: str