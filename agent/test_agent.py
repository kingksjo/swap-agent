#!/usr/bin/env python3
"""Simple test script for the agent API"""

import requests
import json

AGENT_URL = "http://localhost:8000"
AGENT_API_KEY = "dev-agent-key"  # Match the key from your .env file

def test_basic_chat():
    """Test basic chat functionality"""
    print("🧪 Testing basic chat...")
    
    response = requests.post(
        f"{AGENT_URL}/chat",
        json={"message": "Hello, how are you?"},
        headers={
            "Content-Type": "application/json",
            "x-agent-key": AGENT_API_KEY
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Basic chat works!")
        print(f"Response: {data['messages'][0]['text'][:100]}...")
        return True
    else:
        print(f"❌ Basic chat failed: {response.status_code}")
        print(response.text)
        return False

def test_swap_detection():
    """Test swap intent detection"""
    print("\n🧪 Testing swap detection...")
    
    response = requests.post(
        f"{AGENT_URL}/chat",
        json={"message": "I want to excange my 0.2 ETH to USDC"},
        headers={
            "Content-Type": "application/json",
            "x-agent-key": AGENT_API_KEY
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        messages = data.get('messages', [])
        
        print(f"✅ Received {len(messages)} messages:")
        for i, msg in enumerate(messages):
            print(f"  {i+1}. Type: {msg['type']}")
            if msg['type'] == 'assistant_text':
                print(f"     Text: {msg['text'][:80]}...")
            elif msg['type'] == 'swap_quote':
                quote = msg['data']
                print(f"     Quote: {quote['amount']} {quote['from']} → {quote['min_received']} {quote['to']}")
            elif msg['type'] == 'confirmation_request':
                print(f"     Action ID: {msg['action_id']}")
        
        # Test confirmation if we got one
        confirmation_msg = next((m for m in messages if m['type'] == 'confirmation_request'), None)
        if confirmation_msg:
            test_confirmation(confirmation_msg['action_id'])
        
        return True
    else:
        print(f"❌ Swap detection failed: {response.status_code}")
        print(response.text)
        return False

def test_confirmation(action_id):
    """Test swap confirmation"""
    print(f"\n🧪 Testing confirmation for action: {action_id}")
    
    response = requests.post(
        f"{AGENT_URL}/confirm",
        json={"action_id": action_id, "confirm": True},
        headers={
            "Content-Type": "application/json",
            "x-agent-key": AGENT_API_KEY
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        messages = data.get('messages', [])
        
        print(f"✅ Confirmation successful! Received {len(messages)} messages:")
        for i, msg in enumerate(messages):
            print(f"  {i+1}. Type: {msg['type']}")
            if msg['type'] == 'assistant_text':
                print(f"     Text: {msg['text']}")
            elif msg['type'] == 'swap_result':
                result = msg['data']
                print(f"     TX Hash: {result['tx_hash'][:20]}...")
                print(f"     Status: {result['status']}")
        return True
    else:
        print(f"❌ Confirmation failed: {response.status_code}")
        print(response.text)
        return False

def main():
    print("🚀 Testing SwapAI Agent Backend")
    print("=" * 50)
    
    try:
        # Test if agent is running
        response = requests.get(f"{AGENT_URL}/docs")
        if response.status_code != 200:
            print("❌ Agent not running! Start it with: uvicorn main:app --reload --port 8000")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to agent! Make sure it's running on port 8000")
        print("   Start with: uvicorn main:app --reload --port 8000")
        return
    
    print("✅ Agent is running!")
    
    # Run tests
    basic_ok = test_basic_chat()
    swap_ok = test_swap_detection()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"  Basic Chat: {'✅ PASS' if basic_ok else '❌ FAIL'}")
    print(f"  Swap Detection: {'✅ PASS' if swap_ok else '❌ FAIL'}")
    
    if basic_ok and swap_ok:
        print("\n🎉 All tests passed! Backend is ready for frontend integration.")
    else:
        print("\n⚠️  Some tests failed. Check the agent logs for errors.")

if __name__ == "__main__":
    main()
