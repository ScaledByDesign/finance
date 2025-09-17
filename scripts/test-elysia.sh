#!/bin/bash

# Test Elysia Integration
echo "======================================"
echo "   Elysia AI Integration Test Suite"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1. Testing Health Endpoints..."
HEALTH_RESULT=$(curl -s http://localhost:8000/health)
if [[ "$HEALTH_RESULT" == *"healthy"* ]]; then
    echo -e "${GREEN}✓ Elysia Backend Health: OK${NC}"
else
    echo -e "${RED}✗ Elysia Backend Health: FAILED${NC}"
fi

WEAVIATE_RESULT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/v1/.well-known/ready)
if [[ "$WEAVIATE_RESULT" == "200" ]]; then
    echo -e "${GREEN}✓ Weaviate Health: OK${NC}"
else
    echo -e "${RED}✗ Weaviate Health: FAILED${NC}"
fi

APP_HEALTH=$(curl -s http://localhost:3002/api/v1/elysia/health)
if [[ "$APP_HEALTH" == *"healthy"* ]]; then
    echo -e "${GREEN}✓ App Integration Health: OK${NC}"
else
    echo -e "${RED}✗ App Integration Health: FAILED${NC}"
fi

echo ""

# Test 2: Simple Query
echo "2. Testing Simple Analysis Query..."
SIMPLE_RESPONSE=$(curl -s -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "What is a budget?", "user_id": "test-user"}')

if [[ "$SIMPLE_RESPONSE" == *"response"* ]]; then
    echo -e "${GREEN}✓ Simple Query: OK${NC}"
    echo "   Response: $(echo $SIMPLE_RESPONSE | cut -c1-100)..."
else
    echo -e "${RED}✗ Simple Query: FAILED${NC}"
fi

echo ""

# Test 3: Complex Financial Analysis
echo "3. Testing Complex Financial Analysis..."
COMPLEX_RESPONSE=$(curl -s -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Analyze my spending patterns and suggest budget optimizations",
    "user_id": "test-user",
    "financial_data": {
      "monthly_income": 5000,
      "monthly_expenses": {
        "rent": 1500,
        "food": 600,
        "transport": 300,
        "entertainment": 400,
        "utilities": 200
      }
    }
  }')

if [[ "$COMPLEX_RESPONSE" == *"response"* ]]; then
    echo -e "${GREEN}✓ Complex Analysis: OK${NC}"
    echo "   Response: $(echo $COMPLEX_RESPONSE | cut -c1-100)..."
else
    echo -e "${RED}✗ Complex Analysis: FAILED${NC}"
fi

echo ""
echo "======================================"
echo "Test Suite Complete!"
echo ""
echo "Access Points:"
echo "  • Main App: http://localhost:3002"
echo "  • Elysia API: http://localhost:8000"
echo "  • Weaviate: http://localhost:8080"
echo ""
echo "Next Steps:"
echo "  1. Login to the app at http://localhost:3002"
echo "  2. Navigate to the chat interface"
echo "  3. Try complex financial queries"
echo "======================================"