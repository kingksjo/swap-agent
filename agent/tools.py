import json
import uuid
from typing import Dict, Any, Optional
from llm_client import llm
from langchain_core.messages import SystemMessage, HumanMessage
import requests
import os

# --- Backend API Configuration ---
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080")
AUTOSWAP_API_KEY = os.getenv("AUTOSWAP_API_KEY", "local-dev-key-1")

def _make_backend_request(method: str, endpoint: str, json_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """Helper function to make authenticated requests to the backend."""
    headers = {
        "Content-Type": "application/json",
        "x-api-key": AUTOSWAP_API_KEY,
    }
    try:
        if method.upper() == 'POST':
            response = requests.post(f"{BACKEND_URL}{endpoint}", headers=headers, json=json_data, timeout=30)
        else: # GET
            response = requests.get(f"{BACKEND_URL}{endpoint}", headers=headers, params=json_data, timeout=30)
        
        response.raise_for_status() # Raises an exception for 4XX/5XX errors
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error calling backend API {endpoint}: {e}")
        # Return a structured error that the agent can understand
        return {"error": "BACKEND_API_ERROR", "message": str(e)}

# --- Agent Tools ---

async def get_quote(from_token: str, to_token: str, amount: str) -> Dict[str, Any]:
    """Gets a swap quote from the backend."""
    print(f"Getting quote from backend for {amount} {from_token} -> {to_token}...")
    payload = {
        "fromToken": from_token,
        "toToken": to_token,
        "amount": amount,
    }
    # Note: Backend's /quote is a GET request with query params
    return _make_backend_request('GET', '/quote', json_data=payload)

async def execute_swap(from_token: str, to_token: str, amount: str, slippage_bps: int, recipient: str) -> Dict[str, Any]:
    """Executes a swap using the backend."""
    print(f"Executing swap via backend for {amount} {from_token} -> {to_token}...")
    payload = {
        "fromToken": from_token,
        "toToken": to_token,
        "amount": amount,
        "slippageBps": slippage_bps,
        "recipient": recipient,
    }
    return _make_backend_request('POST', '/swap', json_data=payload)

async def approve_token(token: str, amount_wei: str) -> Dict[str, Any]:
    """Approves a token for swapping using the backend."""
    print(f"Approving token {token} for swapping via backend...")
    payload = {
        "token": token,
        "amountWei": amount_wei,
        # Spender is defaulted by the backend
    }
    return _make_backend_request('POST', '/approve', json_data=payload)

async def get_transaction_status(tx_hash: str) -> Dict[str, Any]:
    """Gets the status of a transaction from the backend."""
    print(f"Getting status for tx: {tx_hash}...")
    return _make_backend_request('GET', f'/status/{tx_hash}')

async def detect_swap_intent(user_message: str) -> Optional[Dict[str, Any]]:
    """Use LLM to intelligently detect swap intent and extract parameters"""
    
    intent_prompt = f"""You are analyzing this user message to detect if they want to perform a token swap:

"{user_message}"

If this is a swap request, respond with EXACTLY this format (no extra text):
{{"is_swap": true, "from_token": "TOKEN1", "to_token": "TOKEN2", "amount": 1.5}}

If this is NOT a swap request, respond with EXACTLY:
{{"is_swap": false}}

Examples:
- "Swap 0.5 ETH to USDC" → {{"is_swap": true, "from_token": "ETH", "to_token": "USDC", "amount": 0.5}}
- "Trade my ETH for some USDC, about half an ETH" → {{"is_swap": true, "from_token": "ETH", "to_token": "USDC", "amount": 0.5}}
- "How are you today?" → {{"is_swap": false}}

Remember: Only return the JSON object, nothing else."""

    messages = [
        SystemMessage(content="You are a JSON-only response generator. Return only valid JSON with no extra text or explanation."),
        HumanMessage(content=intent_prompt)
    ]
    
    try:
        response = await llm.ainvoke(messages)
        raw_response = response.content.strip()
        
        # Clean the response - remove any markdown formatting or extra text
        import re
        
        # Remove markdown code blocks if present
        raw_response = re.sub(r'```(?:json)?\s*', '', raw_response)
        raw_response = re.sub(r'\s*```', '', raw_response)
        
        # Find JSON object in the response
        json_match = re.search(r'\{[^}]*\}', raw_response)
        if not json_match:
            print(f"No JSON found in response: {raw_response}")
            return None
            
        json_str = json_match.group()
        result = json.loads(json_str)
        
        # Validate the response structure
        if not isinstance(result, dict) or 'is_swap' not in result:
            print(f"Invalid JSON structure: {result}")
            return None
            
        if result.get("is_swap") is True:
            # Validate required fields for swap
            required_fields = ["from_token", "to_token", "amount"]
            if not all(field in result for field in required_fields):
                print(f"Missing required fields in swap response: {result}")
                return None
                
            return {
                "from_token": str(result["from_token"]).upper(),
                "to_token": str(result["to_token"]).upper(), 
                "amount": float(result["amount"])
            }
        
        # Not a swap request
        return None
        
    except (json.JSONDecodeError, KeyError, ValueError, TypeError) as e:
        print(f"Error parsing LLM intent response: {e}")
        print(f"Raw response: {raw_response if 'raw_response' in locals() else 'No response'}")
        return None
    except Exception as e:
        print(f"Unexpected error in intent detection: {e}")
        return None
