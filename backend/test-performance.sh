#!/bin/bash

# AutoSwap Performance Test Suite
# ==============================

BASE_URL="http://localhost:8080"
API_KEY="local-dev-key-1"

echo "🚀 AutoSwap Performance Test Suite"
echo "=================================="

# Test response times
test_endpoint_performance() {
    local endpoint="$1"
    local method="$2"
    local data="$3"
    local description="$4"
    
    echo -e "\n📊 Testing: $description"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        time_output=$(curl -w "@-" -o /dev/null -s -H "x-api-key: $API_KEY" "$BASE_URL$endpoint" <<'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF
)
    else
        time_output=$(curl -w "@-" -o /dev/null -s -H "x-api-key: $API_KEY" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint" <<'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF
)
    fi
    
    echo "$time_output"
}

# Performance Tests
test_endpoint_performance "/health" "GET" "" "Health Check"
test_endpoint_performance "/api/autoswap/connection" "GET" "" "AutoSwap Connection"
test_endpoint_performance "/tokens" "GET" "" "Token List (Health Route)"
test_endpoint_performance "/api/quote?fromToken=ETH&toToken=USDC&amount=0.1" "GET" "" "Mock Quote"
test_endpoint_performance "/api/autoswap/quote?fromToken=ETH&toToken=USDC&amount=0.1" "GET" "" "Real AutoSwap Quote"
test_endpoint_performance "/api/swap" "POST" '{"fromToken":"ETH","toToken":"USDC","amount":"0.01","userAddress":"0x123"}' "Mock Swap"
test_endpoint_performance "/api/autoswap/execute" "POST" '{"fromToken":"ETH","toToken":"USDC","amount":"0.01","userAddress":"0x123"}' "Real AutoSwap Swap"

# Load Testing
echo -e "\n🔥 Load Testing (10 concurrent requests)"
echo "========================================"

load_test() {
    local endpoint="$1"
    local description="$2"
    
    echo -e "\nLoad testing: $description"
    echo "Making 10 concurrent requests to $endpoint"
    
    for i in {1..10}; do
        curl -s -H "x-api-key: $API_KEY" "$BASE_URL$endpoint" > /dev/null &
    done
    
    wait
    echo "✅ Completed 10 concurrent requests"
}

load_test "/health" "Health Endpoint"
load_test "/api/quote?fromToken=ETH&toToken=USDC&amount=0.1" "Quote Endpoint"
load_test "/api/autoswap/connection" "AutoSwap Connection"

echo -e "\n✅ Performance testing complete!"
