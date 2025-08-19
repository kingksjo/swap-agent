#!/bin/bash

echo "🧪 Testing AutoSwap Contract Integration"
echo "========================================"

# Start the server in background
echo "Starting backend server..."
cd /home/vahalla/Desktop/swap-agent/backend
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 5

echo -e "\n🔗 Testing StarkNet Connection..."
curl -s -H "x-api-key: local-dev-key-1" \
  "http://localhost:8080/api/connection-test" | jq .

echo -e "\n💱 Testing Real AutoSwap Quote..."
curl -s -H "x-api-key: local-dev-key-1" \
  "http://localhost:8080/api/quote?fromToken=ETH&toToken=USDC&amount=0.1" | jq .

echo -e "\n🔄 Testing Real AutoSwap Swap..."
curl -s -H "x-api-key: local-dev-key-1" \
  -H "Content-Type: application/json" \
  -d '{"fromToken":"ETH","toToken":"USDC","amount":"0.01","slippage":50}' \
  http://localhost:8080/api/swap-real | jq .

# Clean up
kill $SERVER_PID 2>/dev/null

echo -e "\n✅ AutoSwap Integration Tests Complete!"
