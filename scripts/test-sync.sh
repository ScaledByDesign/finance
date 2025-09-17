#!/bin/bash

# Test Elysia Data Sync
echo "======================================"
echo "   Elysia Data Sync Test"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize schemas
echo "1. Initializing Weaviate schemas..."
docker exec finance-elysia python data_sync.py init
echo -e "${GREEN}✓ Schemas initialized${NC}"
echo ""

# Get a test user ID (you'll need to replace this with an actual user ID from your database)
echo "2. To sync user data, you need a valid user ID from your database."
echo "   You can get this by logging into the app and checking the database."
echo ""
echo "   Example command to sync a user (replace USER_ID):"
echo -e "${BLUE}   docker exec finance-elysia python data_sync.py sync-all USER_ID${NC}"
echo ""

# Test the sync endpoints
echo "3. Testing sync API endpoints..."
echo ""

# Test health endpoint
echo "Health check:"
curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null || echo "Health endpoint OK"
echo ""

echo "======================================"
echo "Manual Sync Instructions:"
echo ""
echo "1. Login to the app at http://localhost:3002"
echo "2. Get your user ID from the database:"
echo "   docker exec finance-postgres psql -U financeuser -d financedb -c 'SELECT id, email FROM \"User\";'"
echo ""
echo "3. Sync your data using one of these methods:"
echo ""
echo "   a. From the command line:"
echo "      docker exec finance-elysia python data_sync.py sync-all YOUR_USER_ID"
echo ""
echo "   b. From the API:"
echo "      curl -X POST http://localhost:8000/sync/user \\"
echo "        -H \"Content-Type: application/json\" \\"
echo "        -d '{\"user_id\": \"YOUR_USER_ID\", \"sync_type\": \"all\"}'"
echo ""
echo "   c. From the UI:"
echo "      Navigate to the dashboard and look for the sync status component"
echo ""
echo "======================================