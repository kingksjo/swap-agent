import json
import uuid
from typing import Dict, Any, Optional
from llm_client import llm
from langchain_core.messages import SystemMessage, HumanMessage

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

def mock_quote(from_token: str, to_token: str, amount: float) -> Dict[str, Any]:
    """Generate a mock swap quote for testing"""
    
    # Mock conversion rates (USD values)
    rates = {
        "ETH": 3200, 
        "USDC": 1, 
        "DAI": 1, 
        "STRK": 2.5,
        "BTC": 65000,
        "USDT": 1
    }
    
    from_rate = rates.get(from_token, 1)
    to_rate = rates.get(to_token, 1) 
    
    # Calculate estimated output with 1% slippage
    estimated_output = (amount * from_rate / to_rate) * 0.99
    
    # Calculate price impact (mock - higher for larger trades)
    price_impact_bps = min(100, int(amount * from_rate / 10000 * 100))  # Max 1%
    
    return {
        "from": from_token,
        "to": to_token,
        "amount": str(amount),
        "min_received": str(round(estimated_output, 6)),
        "route": ["Uniswap V3", "1inch"] if from_token != to_token else ["Direct"],
        "price_impact_bps": price_impact_bps,
        "slippage_bps": 100  # 1% default slippage
    }

def mock_swap(action_id: str) -> Dict[str, Any]:
    """Generate a mock swap execution result"""
    return {
        "tx_hash": f"0x{uuid.uuid4().hex[:64]}", 
        "status": "PENDING"
    }
