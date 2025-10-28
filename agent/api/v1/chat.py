"""Chat API router wiring FastAPI to the LangGraph agent."""

from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from pydantic import BaseModel, Field

from agent.core import settings
from agent.graph.agent import app as graph_app


router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., description="User input text")
    session_id: Optional[str] = Field(
        default=None, description="Existing session identifier for continuity"
    )
    context: Optional[Dict[str, Any]] = Field(
        default=None, description="Arbitrary session context provided by the client"
    )
    system_prompt: Optional[str] = Field(
        default=None, description="Optional override for the system prompt"
    )


class AgentMessage(BaseModel):
    type: str
    text: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    session_id: str
    messages: List[AgentMessage]


def verify_agent_key(x_agent_key: Optional[str] = Header(default=None)) -> None:
    configured = settings.agent_api_key
    if configured and x_agent_key != configured:
        raise HTTPException(status_code=401, detail="Invalid or missing agent API key")


def _format_messages(agent_state: Dict[str, Any]) -> List[AgentMessage]:
    messages: List[BaseMessage] = agent_state.get("messages", [])
    assistant_messages = [m for m in messages if isinstance(m, AIMessage)]

    formatted: List[AgentMessage] = []

    if assistant_messages:
        last_message = assistant_messages[-1]
        if last_message.content:
            formatted.append(AgentMessage(type="assistant_text", text=last_message.content))

    if agent_state.get("awaiting_confirmation") and agent_state.get("tool_result"):
        formatted.append(
            AgentMessage(
                type="confirmation_request",
                data=agent_state.get("tool_result"),
            )
        )

    error_msg = agent_state.get("error")
    if error_msg:
        formatted.append(AgentMessage(type="error", data={"message": str(error_msg)}))

    return formatted or [AgentMessage(type="assistant_text", text="")]


@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(verify_agent_key)])
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    session_id = request.session_id or str(uuid.uuid4())

    inputs: Dict[str, Any] = {
        "messages": [HumanMessage(content=request.message)],
    }

    session_payload: Dict[str, Any] = {}
    if request.system_prompt:
        session_payload["system_prompt"] = request.system_prompt
    if request.context is not None:
        session_payload["context"] = request.context
    if session_payload:
        inputs["session"] = session_payload

    try:
        agent_state: Dict[str, Any] = graph_app.invoke(
            inputs,
            config={"configurable": {"thread_id": session_id}},
        )
    except Exception as exc:  # noqa: BLE001
        print("Error invoking graph app:", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    formatted = _format_messages(agent_state)

    return ChatResponse(session_id=session_id, messages=formatted)

