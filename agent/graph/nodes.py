"""Graph nodes for the LangGraph workflow."""

from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import StructuredTool

from agent.core import settings
from agent.graph.state import AgentState
from agent.llm_client import llm
from agent.system_prompt import DEFAULT_SYSTEM_PROMPT
from agent.tools.send import SendRequest, SendTool


send_tool = SendTool()


def _prepare_send_tool(**kwargs) -> Dict[str, Any]:
    try:
        request = SendRequest(**kwargs)
        result = send_tool.prepare_transaction(request)
        return result.model_dump(mode="json")
    except ValueError as e:
        # Pydantic validation errors or business logic errors
        raise ValueError(f"Invalid send parameters: {str(e)}")
    except Exception as e:
        # Any other unexpected errors
        raise RuntimeError(f"Send tool failed: {str(e)}")


prepare_send_structured_tool = StructuredTool.from_function(
    _prepare_send_tool,
    name="prepare_send_transaction",
    description="Prepare an unsigned transaction for sending native tokens (ETH, MATIC, BNB) or ERC20 tokens (USDC, DAI, USDT) across multiple EVM networks including Base blockchain (Coinbase L2), Ethereum, Optimism, Polygon, and BNB Chain. Validates addresses, estimates gas fees, and returns transaction details for user confirmation. Always requires explicit user confirmation before revealing transaction JSON.",
)


llm_with_tools = llm.bind_tools([prepare_send_structured_tool])

BASE_SYSTEM_PROMPT = settings.agent_system_prompt or DEFAULT_SYSTEM_PROMPT

AFFIRMATIVE_KEYWORDS = (
    "yes",
    "confirm",
    "proceed",
    "approved",
    "looks good",
    "go ahead",
    "sounds good",
    "do it",
    "send it",
    "continue",
)

NEGATIVE_KEYWORDS = (
    "no",
    "cancel",
    "stop",
    "don't",
    "do not",
    "reject",
    "decline",
    "abort",
    "wait",
    "hold on",
)


def _last_user_message(messages: List[Any]) -> Optional[HumanMessage]:
    for message in reversed(messages):
        if isinstance(message, HumanMessage):
            return message
    return None


def _normalize(text: str) -> str:
    lowered = text.lower().replace("’", "'")
    return re.sub(r"\s+", " ", lowered).strip()


def _is_affirmative(text: str) -> bool:
    normalized = _normalize(text)
    return any(keyword in normalized for keyword in AFFIRMATIVE_KEYWORDS)


def _is_negative(text: str) -> bool:
    normalized = _normalize(text)
    return any(keyword in normalized for keyword in NEGATIVE_KEYWORDS)


def agent_node(state: AgentState, config: RunnableConfig) -> AgentState:
    messages: List = list(state.get("messages", []))
    tool_result: Optional[Dict[str, Any]] = state.get("tool_result")
    awaiting_confirmation: bool = state.get("awaiting_confirmation", False)
    error: Optional[str] = state.get("error")

    llm_messages: List[Any] = []
    base_prompt = BASE_SYSTEM_PROMPT
    if base_prompt:
        llm_messages.append(SystemMessage(content=base_prompt))

    session_ctx = state.get("session") or {}
    session_system_prompt = None
    session_context = None
    if isinstance(session_ctx, dict):
        session_system_prompt = session_ctx.get("system_prompt")
        session_context = session_ctx.get("context")

    if isinstance(session_system_prompt, str) and session_system_prompt.strip():
        llm_messages.append(SystemMessage(content=session_system_prompt))

    if session_context:
        try:
            context_text = json.dumps(session_context, indent=2)
        except TypeError:
            context_text = str(session_context)
        llm_messages.append(
            SystemMessage(
                content=(
                    "Session context information (use to personalise your responses and when preparing transactions):\n"
                    f"{context_text}"
                )
            )
        )

    extra_system_messages: List[SystemMessage] = []
    next_tool_result = tool_result
    next_awaiting_confirmation = awaiting_confirmation
    clear_error = False

    if error:
        extra_system_messages.append(
            SystemMessage(
                content=(
                    "A recent tool invocation failed with the following error:\n"
                    f"{error}\n"
                    "Apologize, explain the issue, and offer to help the user try again with adjusted parameters."
                )
            )
        )
        clear_error = True

    if tool_result:
        summary = tool_result.get("summary", "")
        sender = tool_result.get("sender_address", "")
        recipient = tool_result.get("recipient_address", "")
        network = tool_result.get("network", "")
        amount = tool_result.get("amount")
        fee_info = tool_result.get("fee_info", {})

        if not awaiting_confirmation:
            next_awaiting_confirmation = True
            extra_system_messages.append(
                SystemMessage(
                    content=(
                        "You have just prepared an unsigned transaction using the send tool. Present the summary, and ask the user for explicit confirmation "
                        "before sharing the raw transaction. Invite them to adjust details if needed.\n\n"
                        f"Summary:\n{summary}\n"
                        f"Sender: {sender}\nRecipient: {recipient}\nNetwork: {network}\nAmount: {amount}\n"
                        f"Fee info: {fee_info}\n"
                        "Do not reveal the transaction JSON unless they clearly confirm."
                    )
                )
            )
        else:
            last_user = _last_user_message(messages)
            if last_user:
                user_text = last_user.content
                if _is_affirmative(user_text):
                    transaction = tool_result.get("transaction", {})
                    tx_json = json.dumps(transaction, indent=2)
                    next_awaiting_confirmation = False
                    next_tool_result = None
                    extra_system_messages.append(
                        SystemMessage(
                            content=(
                                "The user confirmed. Provide the unsigned transaction JSON, remind them to sign it themselves, and restate key fields (amount, sender, recipient, network)."
                                f"\n\nSummary:\n{summary}\nUnsigned transaction JSON:\n```json\n{tx_json}\n```"
                            )
                        )
                    )
                elif _is_negative(user_text):
                    next_awaiting_confirmation = False
                    next_tool_result = None
                    extra_system_messages.append(
                        SystemMessage(
                            content=(
                                "The user declined. Acknowledge the cancellation, confirm nothing was sent, and offer to help gather new parameters if they still want to send."
                            )
                        )
                    )
                else:
                    extra_system_messages.append(
                        SystemMessage(
                            content=(
                                "You are still waiting on confirmation. Politely remind the user of the summary below and ask for a clear yes/no or revised parameters.\n\n"
                                f"Summary:\n{summary}"
                            )
                        )
                    )

    llm_messages.extend(extra_system_messages)
    llm_messages.extend(messages)

    response = llm_with_tools.invoke(llm_messages, config=config)

    if not isinstance(response, AIMessage):
        response = AIMessage(content=str(response))

    new_messages = messages + [response]

    new_state: AgentState = {"messages": new_messages}

    if response.tool_calls:
        new_state["tool_call"] = response.tool_calls

    if next_tool_result is not None:
        new_state["tool_result"] = next_tool_result
        new_state["awaiting_confirmation"] = bool(next_awaiting_confirmation)
        if next_awaiting_confirmation:
            new_state["awaiting_confirmation_tool"] = prepare_send_structured_tool.name
        else:
            new_state["awaiting_confirmation_tool"] = None
    else:
        new_state["tool_result"] = None
        new_state["awaiting_confirmation"] = False
        new_state["awaiting_confirmation_tool"] = None

    if clear_error:
        new_state["error"] = None

    if session_ctx:
        new_state["session"] = session_ctx

    return new_state


def agent_condition(state: AgentState) -> str:
    tool_calls = state.get("tool_call")
    # Only route to tool if there are actual tool calls to process
    if tool_calls and len(tool_calls) > 0:
        return "tool"
    return "respond"


def tool_router(state: AgentState, config: RunnableConfig) -> AgentState:
    messages: List = list(state.get("messages", []))
    tool_calls = state.get("tool_call", []) or []

    new_messages = messages.copy()
    tool_results: List[Dict[str, Any]] = []

    for call in tool_calls:
        tool_name = call.get("name")
        tool_args = call.get("args", {}) or {}
        tool_id = call.get("id")

        if tool_name == prepare_send_structured_tool.name:
            try:
                result_dict = _prepare_send_tool(**tool_args)
                tool_results.append(result_dict)
                content = json.dumps(result_dict)
                new_messages.append(
                    ToolMessage(content=content, tool_call_id=tool_id or "prepare_send_transaction")
                )
            except Exception as exc:  # noqa: BLE001
                error_msg = f"Send tool failed: {exc}"
                new_messages.append(
                    ToolMessage(
                        content=json.dumps({"error": error_msg}),
                        tool_call_id=tool_id or "prepare_send_transaction",
                    )
                )
                result_state: AgentState = {"messages": new_messages, "error": error_msg}
                # Clear tool_call to prevent loops - completely remove the key
                # Don't set tool_call in result_state at all
                session_ctx = state.get("session")
                if session_ctx is not None:
                    result_state["session"] = session_ctx
                return result_state
        else:
            error_msg = f"Unsupported tool requested: {tool_name}"
            new_messages.append(
                ToolMessage(content=json.dumps({"error": error_msg}), tool_call_id=tool_id or "unknown")
            )
            result_state: AgentState = {"messages": new_messages, "error": error_msg}
            # Clear tool_call to prevent loops - completely remove the key
            # Don't set tool_call in result_state at all
            session_ctx = state.get("session")
            if session_ctx is not None:
                result_state["session"] = session_ctx
            return result_state

    result_state: AgentState = {"messages": new_messages}

    if tool_results:
        last_result = tool_results[-1]
        result_state["tool_result"] = last_result
        result_state["awaiting_confirmation"] = True
        result_state["awaiting_confirmation_tool"] = prepare_send_structured_tool.name

    # Clear the tool_call to prevent infinite loops - completely remove the key
    # Don't set tool_call in result_state at all - let it be absent

    session_ctx = state.get("session")
    if session_ctx is not None:
        result_state["session"] = session_ctx

    return result_state

