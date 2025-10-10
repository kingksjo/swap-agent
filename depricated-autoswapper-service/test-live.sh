#!/bin/bash

# Live AutoSwap Integration Test
# ============================

BASE_URL="http://localhost:8080"
API_KEY="local-dev-key-1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results
PASS=0
FAIL=0
TOTAL=0

# Helper function
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_code="$5"
    
    TOTAL=$((TOTAL + 1))
    echo -e "\n${BLUE}Test $TOTAL: $name${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -H "x-api-key: $API_KEY" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -H "x-api-key: $API_KEY" -H "Content-Type: application/json" -d "$data" -X "$method" "$BASE_URL$endpoint")
    fi
    
    # Extract status code
    status_code=$(echo "$response" | grep -o 'HTTPSTATUS:[0-9]*' | cut -d: -f2)
    body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')
    
    echo "Status: $status_code"
    echo "Response: $body"
    
    if [ "$status_code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}❌ FAIL (Expected: $expected_code, Got: $status_code)${NC}"
        FAIL=$((FAIL + 1))
    fi
}

echo -e "${YELLOW}🧪 Live AutoSwap Integration Test${NC}"
echo "=================================="

# Check if server is running
echo "Checking server status..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}❌ Server not running. Start with: npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"

# Run tests
test_api "Health Check" "GET" "/health" "" "200"
test_api "Missing API Key" "GET" "/api/autoswap/connection" "" "401"
test_api "Invalid API Key" "GET" "/api/autoswap/connection" "" "401"
test_api "StarkNet Connection" "GET" "/api/autoswap/connection" "" "200"
test_api "Token List" "GET" "/api/tokens" "" "200"
test_api "Mock Quote" "GET" "/api/quote?fromToken=ETH&toToken=USDC&amount=0.1" "" "200"
test_api "Real AutoSwap Quote" "GET" "/api/autoswap/quote?fromToken=ETH&toToken=USDC&amount=0.1" "" "200"
test_api "Invalid Quote Params" "GET" "/api/autoswap/quote?fromToken=ETH" "" "400"
test_api "Same Token Quote" "GET" "/api/autoswap/quote?fromToken=ETH&toToken=ETH&amount=0.1" "" "400"
test_api "Zero Amount Quote" "GET" "/api/autoswap/quote?fromToken=ETH&toToken=USDC&amount=0" "" "400"
test_api "Mock Swap" "POST" "/api/swap" '{"fromToken":"ETH","toToken":"USDC","amount":"0.01"}' "200"
test_api "Real AutoSwap Swap" "POST" "/api/autoswap/execute" '{"fromToken":"ETH","toToken":"USDC","amount":"0.01"}' "200"
test_api "Invalid Swap Data" "POST" "/api/autoswap/execute" '{"fromToken":"ETH"}' "400"
test_api "Transaction Status" "GET" "/api/status/0x1234567890abcdef" "" "200"

# Summary
echo -e "\n${YELLOW}📊 Test Results${NC}"
echo "==============="
echo -e "Total: $TOTAL"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"

if [ $FAIL -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    echo -e "${GREEN}AutoSwap integration is working correctly.${NC}"
else
    echo -e "\n${RED}❌ $FAIL test(s) failed.${NC}"
    echo -e "${YELLOW}Check the server logs for details.${NC}"
fi
