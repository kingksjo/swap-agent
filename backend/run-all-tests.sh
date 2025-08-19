#!/bin/bash

# AutoSwap Test Runner
# ===================

echo "🚀 AutoSwap Test Runner"
echo "======================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Run this script from the backend directory${NC}"
    exit 1
fi

echo -e "\n${BLUE}1. Running Implementation Verification${NC}"
echo "======================================"
chmod +x verify-implementation.sh
./verify-implementation.sh

echo -e "\n${BLUE}2. Starting Backend Server${NC}"
echo "=========================="
echo "Starting server in background..."

# Start server in background
npm run dev > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 5

# Check if server is running
if ! curl -s http://localhost:8080/health > /dev/null; then
    echo -e "${RED}❌ Server failed to start${NC}"
    echo "Server log:"
    cat server.log
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Server started successfully${NC}"

echo -e "\n${BLUE}3. Running Live Integration Tests${NC}"
echo "================================="
chmod +x test-live.sh
./test-live.sh

echo -e "\n${BLUE}4. Running Performance Tests${NC}"
echo "============================"
chmod +x test-performance.sh
./test-performance.sh

echo -e "\n${BLUE}5. Cleaning Up${NC}"
echo "==============="
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

# Clean up log file
rm -f server.log

echo -e "\n${GREEN}🎉 All tests completed!${NC}"
echo -e "${YELLOW}Check the results above for any issues.${NC}"
