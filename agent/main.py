import os
import uuid
from typing import Optional, Dict, List, Any

from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from llm_client import llm  # our existing Groq LLM client
from system_prompt import DEFAULT_SYSTEM_PROMPT
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# Define our input/output models for type safety and validation
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context: Optional[dict] = None
    system_prompt: Optional[str] = None

class ChatResponse(BaseModel):
    messages: list[dict]  # Structured format for frontend
    session_id: Optional[str] = None

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

        # Structured reply for frontend
        return ChatResponse(
            messages=[{"type": "assistant_text", "text": assistant_text}],
            session_id=session_id,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

