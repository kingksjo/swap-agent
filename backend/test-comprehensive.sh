#!/bin/bash

# AutoSwap Contract Integration Test Suite
# =======================================

BASE_URL="http://localhost:8080"
API_KEY="local-dev-key-1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TEST_COUNT=0
PASS_COUNT=0
FAIL_COUNT=0

# Helper function to run tests
run_test() {
    local test_name="$1"
    local curl_command="$2"
    local expected_pattern="$3"
    
    TEST_COUNT=$((TEST_COUNT + 1))
    echo -e "\n${BLUE}Test $TEST_COUNT: $test_name${NC}"
    echo "Command: $curl_command"
    
    # Execute the curl command
    response=$(eval "$curl_command" 2>/dev/null)
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo "Response: $response"
        
        # Check if response matches expected pattern
        if echo "$response" | grep -q "$expected_pattern"; then
            echo -e "${GREEN}✅ PASS${NC}"
            PASS_COUNT=$((PASS_COUNT + 1))
        else
            echo -e "${RED}❌ FAIL - Expected pattern '$expected_pattern' not found${NC}"
            FAIL_COUNT=$((FAIL_COUNT + 1))
        fi
    else
        echo -e "${RED}❌ FAIL - Curl command failed with exit code $exit_code${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

echo -e "${YELLOW}🧪 AutoSwap Contract Integration Test Suite${NC}"
echo "============================================="

# Check if server is running
echo -e "\n${BLUE}Checking if server is running...${NC}"
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}❌ Server is not running on $BASE_URL${NC}"
    echo "Please start the server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"

# Test 1: Health Check
run_test "Health Check" \
    "curl -s '$BASE_URL/health'" \
    '"status":"ok"'

# Test 2: Authentication - Missing API Key
run_test "Authentication - Missing API Key" \
    "curl -s '$BASE_URL/api/autoswap/connection'" \
    '"code":"MISSING_API_KEY"'

# Test 3: Authentication - Invalid API Key
run_test "Authentication - Invalid API Key" \
    "curl -s -H 'x-api-key: invalid-key' '$BASE_URL/api/autoswap/connection'" \
    '"code":"INVALID_API_KEY"'

# Test 4: StarkNet Connection Test
run_test "StarkNet Connection Test" \
    "curl -s -H 'x-api-key: $API_KEY' '$BASE_URL/api/autoswap/connection'" \
    '"connected"'

# Test 5: Token List
run_test "Token List" \
    "curl -s -H 'x-api-key: $API_KEY' '$BASE_URL/api/tokens'" \
    '"tokens"'

# Test 6: Mock Quote
run_test "Mock Quote - ETH to USDC" \
    "curl -s -H 'x-api-key: $API_KEY' '$BASE_URL/api/quote?fromToken=ETH&toToken=USDC&amount=0.1'" \
    '"estimatedOutput"'

# Test 7: Real AutoSwap Quote
run_test "Real AutoSwap Quote - ETH to USDC" \
    "curl -s -H 'x-api-key: $API_KEY' '$BASE_URL/api/autoswap/quote?fromToken=ETH&toToken=USDC&amount=0.1'" \
    '"estimatedOutput"'

# Test 8: Quote Validation - Missing Parameters
run_test "Quote Validation - Missing Parameters" \
    "curl -s -H 'x-api-key: $API_KEY' '$BASE_URL/api/autoswap/quote?fromToken=ETH'" \
    '"code":"MISSING_PARAMETERS"'

# Test 9: Quote Validation - Same Token
run_test "Quote Validation - Same Token Pair" \
    "curl -s -H 'x-api-key: $API_KEY' '$BASE_URL/api/autoswap/quote?fromToken=ETH&toToken=ETH&amount=0.1'" \
    '"code":"INVALID_TOKEN_PAIR"'

# Test 10: Quote Validation - Invalid Amount
run_test "Quote Validation - Invalid Amount" \
    "curl -s -H 'x-api-key: $API_KEY' '$BASE_URL/api/autoswap/quote?fromToken=ETH&toToken=USDC&amount=0'" \
    '"code":"INVALID_AMOUNT"'

# Test 11: Mock Swap Execution
run_test "Mock Swap Execution - ETH to USDC" \
    "curl -s -H 'x-api-key: $API_KEY' -H 'Content-Type: application/json' -d '{\"fromToken\":\"ETH\",\"toToken\":\"USDC\",\"amount\":\"0.01\"}' '$BASE_URL/api/swap'" \
    '"status":"success"'

# Test 12: Real AutoSwap Execution
run_test "Real AutoSwap Execution - ETH to USDC" \
    "curl -s -H 'x-api-key: $API_KEY' -H 'Content-Type: application/json' -d '{\"fromToken\":\"ETH\",\"toToken\":\"USDC\",\"amount\":\"0.01\"}' '$BASE_URL/api/autoswap/execute'" \
    '"transactionHash"'

# Test 13: Swap Validation - Missing Fields
run_test "Swap Validation - Missing Fields" \
    "curl -s -H 'x-api-key: $API_KEY' -H 'Content-Type: application/json' -d '{\"fromToken\":\"ETH\"}' '$BASE_URL/api/autoswap/execute'" \
    '"code":"MISSING_FIELDS"'

# Test 14: Contract Address Detection
run_test "Contract Address Detection - Real AutoSwap Contract" \
    "curl -s -H 'x-api-key: $API_KEY' '$BASE_URL/api/autoswap/quote?fromToken=ETH&toToken=USDC&amount=0.1'" \
    '"estimatedOutput"'

# Test 15: Status Check
run_test "Transaction Status Check" \
    "curl -s -H 'x-api-key: $API_KEY' '$BASE_URL/api/status/0x1234567890abcdef'" \
    '"transactionHash"'

# Summary
echo -e "\n${YELLOW}📊 Test Summary${NC}"
echo "==============="
echo -e "Total Tests: $TEST_COUNT"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! AutoSwap integration is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the errors above.${NC}"
    exit 1
fi
