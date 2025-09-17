# Chat Persistence Fix Documentation

## Problem
Chats were not being saved persistently - they were only stored in Redis/memory and would be lost on restart.

## Solution Implemented
Created a dual-persistence system that saves chats to both:
1. **Redis** - For fast access and caching
2. **PostgreSQL** - For permanent storage

## Changes Made

### 1. Fixed Redis Connection Issues
**File**: `src/lib/redis.ts`
- Added smart detection for Docker environment
- Uses `redis://redis:6379` when running in Docker
- Falls back to `redis://localhost:6380` for local development

### 2. Database Persistence Layer
**File**: `src/server/chat.ts` (NEW)
- `saveChatToDB()` - Saves/updates chats in PostgreSQL
- `getChatsFromDB()` - Retrieves all user chats
- `getChatFromDB()` - Gets single chat
- `deleteChatFromDB()` - Deletes chat
- `clearChatsFromDB()` - Clears all user chats

### 3. Enhanced Chat Actions
**File**: `src/app/actions/chat.ts`
- Fixed missing `kv` variable errors in `removeChat()` and `clearChats()`
- Added dual saving to both Redis and PostgreSQL in `saveChat()`
- Implemented automatic fallback to database if Redis is empty
- Added database sync back to Redis for performance

## How It Works

```
User sends message
      ↓
AI processes message
      ↓
Save to Redis (fast cache)
      ↓
Save to PostgreSQL (persistent)
      ↓
On page refresh:
  1. Check Redis first (fast)
  2. If empty, load from DB
  3. Sync back to Redis
```

## Database Schema

The Chat model in Prisma:
```prisma
model Chat {
  id        String   @id @default(uuid())
  chatId    String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String?
  messages  String?  // JSON stringified messages
  path      String?
  createdAt DateTime?
}
```

## Testing

### 1. Manual Testing
1. Open http://localhost:3002
2. Sign in with Google
3. Navigate to Chat
4. Send messages
5. Refresh page - chats persist!

### 2. Database Verification
```bash
# Check saved chats in PostgreSQL
docker exec finance-postgres psql -U financeuser -d financedb -c 'SELECT "chatId", "title", "userId" FROM "Chat";'

# Check Redis cache
docker exec finance-redis redis-cli KEYS 'chat:*'
```

### 3. Test Script
Run: `./scripts/test-chat-saving.sh`

## Benefits

✅ **Persistent Storage** - Chats survive Redis/container restarts
✅ **Fast Access** - Redis cache provides quick retrieval
✅ **Automatic Sync** - Database and cache stay synchronized
✅ **Fallback Protection** - Works even if Redis fails
✅ **Data Recovery** - Can restore from database anytime
✅ **User Isolation** - Each user's chats are properly isolated

## Troubleshooting

### Issue: Chats not saving
1. Check Redis connection:
   ```bash
   docker exec finance-redis redis-cli PING
   ```

2. Check PostgreSQL:
   ```bash
   docker exec finance-postgres psql -U financeuser -d financedb -c "SELECT 1;"
   ```

3. Check app logs:
   ```bash
   docker logs finance-app --tail 50
   ```

### Issue: Redis connection errors
- Ensure `REDIS_URL=redis://redis:6379` is set in docker-compose.yml
- Check Redis container is running: `docker ps | grep redis`
- Restart app container: `docker compose restart app`

### Issue: Database not persisting
- Check Chat table exists:
  ```bash
  docker exec finance-postgres psql -U financeuser -d financedb -c '\d "Chat"'
  ```
- Run migrations if needed:
  ```bash
  docker exec finance-app npx prisma db push
  ```

## Architecture

```
┌─────────────┐
│   Browser   │
└─────┬───────┘
      │
      ▼
┌─────────────┐
│   Next.js   │
│     App     │
└─────┬───────┘
      │
      ├────────────────┬────────────────┐
      ▼                ▼                │
┌─────────────┐  ┌─────────────┐       │
│    Redis    │  │ PostgreSQL  │       │
│   (Cache)   │  │ (Persistent)│       │
└─────────────┘  └─────────────┘       │
                                        │
                                        ▼
                                 ┌─────────────┐
                                 │   Fallback  │
                                 │    Logic    │
                                 └─────────────┘
```

## Future Improvements

1. **Incremental Sync** - Only sync changed messages
2. **Compression** - Compress message JSON before storage
3. **Archival** - Move old chats to archive storage
4. **Export** - Allow users to export chat history
5. **Search** - Full-text search across chat history