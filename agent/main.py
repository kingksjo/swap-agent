import os
import uuid
from typing import Optional, Dict, List, Any

from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from llm_client import llm  # our existing Groq LLM client
from system_prompt import DEFAULT_SYSTEM_PROMPT
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from tools import detect_swap_intent, get_quote, execute_swap, get_transaction_status, approve_token

# Define our input/output models for type safety and validation
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context: Optional[dict] = None
    system_prompt: Optional[str] = None

class ChatResponse(BaseModel):
    messages: list[dict]  # Structured format for frontend
    session_id: Optional[str] = None

class ConfirmRequest(BaseModel):
    action_id: str
    confirm: bool = True

app = FastAPI()

# CORS: allow local frontend by default
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin, "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional API key protection
AGENT_API_KEY = os.getenv("AGENT_API_KEY")

def verify_agent_key(x_agent_key: Optional[str] = Header(default=None)):
    if AGENT_API_KEY:
        if not x_agent_key or x_agent_key != AGENT_API_KEY:
            raise HTTPException(status_code=401, detail="Invalid or missing agent API key")
    return True

# In-memory conversation store: { session_id: [{role, content}] }
conversation_history: Dict[str, List[Dict[str, Any]]] = {}
# In-memory store for pending actions that require confirmation
pending_actions: Dict[str, Dict[str, Any]] = {}

def append_history(session_id: str, role: str, content: str):
    if session_id not in conversation_history:
        conversation_history[session_id] = []
    conversation_history[session_id].append({"role": role, "content": content})
    # keep last N turns to bound context
    max_messages = int(os.getenv("MAX_HISTORY_MESSAGES", "16"))
    if len(conversation_history[session_id]) > max_messages:
        conversation_history[session_id] = conversation_history[session_id][-max_messages:]

@app.post("/chat")
async def chat(request: ChatRequest, _=Depends(verify_agent_key)) -> ChatResponse:
    try:
        # Determine session id
        session_id = request.session_id or str(uuid.uuid4())

        # Build LLM prompt with system instructions and prior turns (LangChain message objects)
        lc_messages: List = []
        # Choose system prompt: request-provided > env override > default
        env_system = os.getenv("AGENT_SYSTEM_PROMPT")
        system_text = request.system_prompt or env_system or DEFAULT_SYSTEM_PROMPT
        if system_text:
            lc_messages.append(SystemMessage(content=system_text))

        # include prior conversation turns, if any
        prior = conversation_history.get(session_id, [])
        if prior:
            for turn in prior:
                role = turn.get("role")
                content = turn.get("content", "")
                if role == "user":
                    lc_messages.append(HumanMessage(content=content))
                else:
                    lc_messages.append(AIMessage(content=content))

        # incorporate optional context into the prompt
        context_snippet = ""
        if request.context:
            try:
                # keep it compact; only expose known keys
                defaults = request.context.get("defaults") if isinstance(request.context, dict) else None
                recipient = request.context.get("recipient") if isinstance(request.context, dict) else None
                parts = []
                if recipient:
                    parts.append(f"recipient: {recipient}")
                if defaults and isinstance(defaults, dict):
                    if "slippage_bps" in defaults:
                        parts.append(f"default_slippage_bps: {defaults['slippage_bps']}")
                if parts:
                    context_snippet = "\nContext (for this session): " + ", ".join(parts)
            except Exception:
                context_snippet = ""

        user_content = request.message + context_snippet
        lc_messages.append(HumanMessage(content=user_content))

        # Invoke LLM (async for non-blocking behavior)
        response = await llm.ainvoke(lc_messages)

        assistant_text = response.content if hasattr(response, "content") else str(response)

        # Persist turn in memory
        append_history(session_id, "user", user_content)
        append_history(session_id, "assistant", assistant_text)

        # Check if this was a swap request and generate structured response
        messages = [{"type": "assistant_text", "text": assistant_text}]
        
        # Detect swap intent using our tool
        swap_intent = await detect_swap_intent(request.message)
        
        if swap_intent:
            # 1. Get a quote from the backend
            quote_data = await get_quote(
                from_token=swap_intent["from_token"],
                to_token=swap_intent["to_token"],
                amount=str(swap_intent["amount"])
            )

            if "error" in quote_data:
                # If the backend returns an error, relay it to the user
                error_message = f"I couldn't get a quote right now. The backend said: {quote_data.get('message', 'Unknown error')}"
                messages.append({"type": "assistant_text", "text": error_message})
            else:
                # 2. If quote is successful, prepare a confirmation action
                action_id = f"swap_{uuid.uuid4().hex[:8]}"
                
                # Store the context for when the user confirms
                pending_actions[action_id] = {
                    "from_token": swap_intent["from_token"],
                    "to_token": swap_intent["to_token"],
                    "amount": str(swap_intent["amount"]),
                    "recipient": request.context.get("recipient") if request.context else None,
                    "slippage_bps": request.context.get("defaults", {}).get("slippage_bps", 100) if request.context else 100,
                    "quote": quote_data.get('data', quote_data) # Handle nested data key
                }

                # 3. Format the messages for the frontend
                messages.extend([
                    {"type": "swap_quote", "data": quote_data.get('data', quote_data)},
                    {"type": "confirmation_request", "action_id": action_id}
                ])

        # Structured reply for frontend
        return ChatResponse(
            messages=messages,
            session_id=session_id,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/confirm")
async def confirm(request: ConfirmRequest, _=Depends(verify_agent_key)) -> ChatResponse:
    """Handle swap confirmation requests"""
    try:
        action_id = request.action_id
        if not request.confirm:
            if action_id in pending_actions:
                del pending_actions[action_id] # Clean up
            return ChatResponse(
                messages=[{"type": "assistant_text", "text": "Swap cancelled. Let me know if you'd like to try again with different parameters! 👍"}]
            )
        
        # Retrieve the stored action details
        action_details = pending_actions.get(action_id)
        if not action_details:
            raise HTTPException(status_code=404, detail="Action not found or has expired.")

        # --- Real Swap Execution ---
        # In a real scenario, you might need an approval first.
        # For now, we proceed directly to swap.
        
        swap_result = await execute_swap(
            from_token=action_details["from_token"],
            to_token=action_details["to_token"],
            amount=action_details["amount"],
            slippage_bps=action_details["slippage_bps"],
            recipient=action_details["recipient"],
        )
        
        # Clean up the pending action once it's been executed
        del pending_actions[action_id]

        if "error" in swap_result:
            error_message = f"The swap failed. The backend said: {swap_result.get('message', 'Unknown error')}"
            return ChatResponse(messages=[{"type": "assistant_text", "text": error_message}])

        return ChatResponse(
            messages=[
                {"type": "assistant_text", "text": "Executing your swap now... 🔄 Your transaction has been submitted to the blockchain."},
                {"type": "swap_result", "data": swap_result.get('data', swap_result)}
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{tx_hash}")
async def get_status(tx_hash: str, _=Depends(verify_agent_key)):
    """Proxy endpoint to get transaction status from the backend."""
    try:
        status_result = await get_transaction_status(tx_hash)
        if "error" in status_result:
            raise HTTPException(status_code=502, detail=status_result.get("message", "Backend status check failed."))
        return status_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

