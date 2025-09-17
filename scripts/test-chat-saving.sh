#!/bin/bash

echo "======================================"
echo "   Chat Saving Test"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Testing chat persistence..."
echo ""

# Check if Redis is working
echo "1. Checking Redis connection..."
docker exec finance-redis redis-cli PING > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${RED}✗ Redis is not responding${NC}"
fi

# Check if PostgreSQL is working
echo ""
echo "2. Checking PostgreSQL connection..."
docker exec finance-postgres psql -U financeuser -d financedb -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not responding${NC}"
fi

# Check Chat table in database
echo ""
echo "3. Checking Chat table in database..."
CHAT_COUNT=$(docker exec finance-postgres psql -U financeuser -d financedb -t -c 'SELECT COUNT(*) FROM "Chat";' 2>/dev/null | tr -d ' ')
if [ -n "$CHAT_COUNT" ]; then
    echo -e "${GREEN}✓ Chat table exists with $CHAT_COUNT records${NC}"
else
    echo -e "${RED}✗ Chat table not accessible${NC}"
fi

echo ""
echo "======================================"
echo "To test chat saving:"
echo ""
echo "1. Open the app: http://localhost:3002"
echo "2. Sign in with your Google account"
echo "3. Navigate to Chat: http://localhost:3002/dashboard/chat"
echo "4. Send a message in the chat"
echo "5. Refresh the page - your chat should persist"
echo ""
echo "To verify in database:"
echo -e "${BLUE}docker exec finance-postgres psql -U financeuser -d financedb -c 'SELECT \"chatId\", \"title\", \"userId\" FROM \"Chat\" ORDER BY \"createdAt\" DESC LIMIT 5;'${NC}"
echo ""
echo "To check Redis cache:"
echo -e "${BLUE}docker exec finance-redis redis-cli KEYS 'chat:*'${NC}"
echo ""
echo "======================================"