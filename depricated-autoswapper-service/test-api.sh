#!/bin/bash

echo "🧪 Testing AutoSwap Backend API"
echo "================================"

# Test Health Endpoint
echo "1. Testing Health Endpoint..."
curl -s http://localhost:8080/health | jq .

echo -e "\n2. Testing Tokens Endpoint..."
curl -s -H "x-api-key: local-dev-key-1" http://localhost:8080/api/tokens | jq .

echo -e "\n3. Testing Quote Endpoint..."
curl -s -H "x-api-key: local-dev-key-1" \
  "http://localhost:8080/api/quote?fromToken=ETH&toToken=USDC&amount=1" | jq .

echo -e "\n4. Testing Swap Endpoint..."
curl -s -H "x-api-key: local-dev-key-1" \
  -H "Content-Type: application/json" \
  -d '{"fromToken":"ETH","toToken":"USDC","amount":"1"}' \
  http://localhost:8080/api/swap | jq .

echo -e "\n5. Testing Status Endpoint..."
curl -s -H "x-api-key: local-dev-key-1" \
  "http://localhost:8080/api/status/0x1234567890abcdef" | jq .

echo -e "\n✅ API Tests Complete!"
