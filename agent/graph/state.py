"""Shared state definition for the LangGraph agent."""

from typing import Annotated, Any, Dict, List, Optional

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


# Use Dict[str, Any] for LangGraph compatibility
# The state can contain these keys, but they're all optional at runtime
AgentState = Dict[str, Any]

# For type hints and documentation, here are the expected keys:
# - messages: Annotated[List[BaseMessage], add_messages] - conversation history
# - tool_call: List[Dict[str, Any]] - pending tool calls from LLM
# - tool_result: Optional[Dict[str, Any]] - result from last tool execution
# - awaiting_confirmation: bool - whether waiting for user confirmation
# - awaiting_confirmation_tool: Optional[str] - which tool is awaiting confirmation
# - error: Optional[str] - error message from failed operations
# - session: Dict[str, Any] - session context and metadata

