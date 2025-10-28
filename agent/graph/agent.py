"""LangGraph workflow definition for the agent."""

from typing import Annotated, List

from langchain_core.messages import BaseMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph
from langgraph.graph.message import add_messages

from agent.graph.state import AgentState
from agent.graph import nodes


def build_agent_graph() -> StateGraph:
    # Define the state schema with proper message handling
    state_schema = {
        "messages": Annotated[List[BaseMessage], add_messages]
    }
    
    workflow = StateGraph(AgentState)

    workflow.add_node("agent", nodes.agent_node)
    workflow.add_node("tool_router", nodes.tool_router)

    workflow.set_entry_point("agent")

    workflow.add_conditional_edges(
        "agent",
        nodes.agent_condition,
        {
            "tool": "tool_router",
            "respond": "__end__",  # End the conversation when no tools are called
        },
    )

    workflow.add_edge("tool_router", "agent")

    return workflow


workflow = build_agent_graph()
memory = MemorySaver()
app = workflow.compile(checkpointer=memory)


__all__ = ["app", "workflow", "build_agent_graph"]

