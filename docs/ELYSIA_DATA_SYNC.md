# Elysia AI Data Synchronization Guide

## Overview

The Elysia AI integration now includes comprehensive data synchronization capabilities that allow your financial data to be analyzed using advanced AI techniques. This system syncs user accounts, transactions, and financial profiles to a Weaviate vector database for semantic search and intelligent analysis.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │────▶│   Elysia     │────▶│   Weaviate   │
│   Frontend   │     │   Backend    │     │   Vector DB  │
└──────────────┘     └──────────────┘     └──────────────┘
       │                     │
       │                     ▼
       │            ┌──────────────┐
       └───────────▶│  PostgreSQL  │
                    │   Database   │
                    └──────────────┘
```

## Features

### 1. **Automatic Data Synchronization**
- Syncs user financial profiles, accounts, and transactions
- Maintains data consistency between PostgreSQL and Weaviate
- Supports incremental updates for efficient synchronization

### 2. **Data Types Synchronized**

#### User Financial Profile
- Total assets and liabilities
- Monthly income and expenses
- Savings rate calculation
- Risk tolerance assessment
- Financial goals tracking

#### Account Data
- Account balances and types
- Institution information
- Currency and limits
- Real-time balance updates

#### Transaction Data
- Transaction history with categorization
- Merchant information
- Payment channels
- Location data (when available)

### 3. **Sync Triggers**
- Manual sync via dashboard
- Auto-sync on first login
- Scheduled sync (every 24 hours)
- Real-time sync via Plaid webhooks (when configured)

## Usage

### From the Dashboard

1. **Sync Status Component**
   The dashboard includes a sync status card showing:
   - Current sync status (Fully Synced, Partially Synced, Not Synced)
   - Last sync timestamp
   - Individual sync status for Profile, Accounts, and Transactions
   - Manual sync button

2. **Auto-Sync**
   The system automatically syncs data:
   - On first login
   - When data is older than 24 hours
   - After Plaid account updates

### Using the API

#### Sync All Data
```typescript
// Using the custom hook
import { useElysiaSync } from '@/hooks/useElysiaSync';

const { syncData, isSyncing } = useElysiaSync();

// Sync all data
await syncData({ sync_type: 'all' });
```

#### Sync Specific Data Types
```typescript
// Sync only transactions
await syncData({
  sync_type: 'transactions',
  limit: 500  // Optional limit
});

// Sync only accounts
await syncData({ sync_type: 'accounts' });

// Sync only profile
await syncData({ sync_type: 'profile' });
```

#### Check Sync Status
```typescript
const { getSyncStatus, syncStatus } = useElysiaSync();

const status = await getSyncStatus();
console.log(status);
// {
//   user_id: "user123",
//   last_sync: "2025-01-17T10:30:00Z",
//   sync_stats: {
//     has_transactions: true,
//     has_accounts: true,
//     has_profile: true
//   }
// }
```

### Direct API Endpoints

#### POST /api/v1/elysia/sync
Sync user data (requires authentication)

```bash
curl -X POST http://localhost:3002/api/v1/elysia/sync \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "sync_type": "all",
    "limit": 500
  }'
```

#### GET /api/v1/elysia/sync
Get sync status (requires authentication)

```bash
curl http://localhost:3002/api/v1/elysia/sync \
  -H "Cookie: your-auth-cookie"
```

### Command Line Interface

For debugging and manual operations:

```bash
# Initialize schemas
docker exec finance-elysia python data_sync.py init

# Sync all data for a user
docker exec finance-elysia python data_sync.py sync-all USER_ID

# Sync only transactions
docker exec finance-elysia python data_sync.py sync-transactions USER_ID

# Sync only accounts
docker exec finance-elysia python data_sync.py sync-accounts USER_ID

# Sync only profile
docker exec finance-elysia python data_sync.py sync-profile USER_ID
```

## How It Enhances AI Analysis

### 1. **Semantic Search**
Weaviate enables semantic search across your financial data, allowing Elysia to:
- Find similar transactions
- Identify spending patterns
- Detect anomalies in financial behavior

### 2. **Pattern Recognition**
The vector database helps identify:
- Recurring expenses
- Seasonal spending variations
- Investment opportunities
- Budget optimization areas

### 3. **Personalized Insights**
With synchronized data, Elysia can provide:
- Customized financial advice
- Predictive analytics for future expenses
- Risk assessment based on historical data
- Goal-based financial planning

### 4. **Real-time Analysis**
Synchronized data enables:
- Instant financial health assessments
- Real-time budget tracking
- Immediate alerts for unusual transactions
- Up-to-date investment recommendations

## Security & Privacy

### Data Protection
- All data is encrypted in transit (HTTPS/TLS)
- Database connections use SSL
- Weaviate runs locally in your infrastructure
- No data leaves your deployment

### Access Control
- Authentication required for all sync operations
- User data isolation (users can only sync their own data)
- Rate limiting to prevent abuse
- Audit logging for all sync operations

### Compliance
- GDPR-compliant data handling
- User consent for data processing
- Data deletion on user request
- Transparent data usage policies

## Performance Considerations

### Sync Limits
- Transactions: 500 per sync (configurable)
- Accounts: No limit (typically < 20)
- Profile: Single record per user

### Optimization Tips
1. **Initial Sync**: May take 10-30 seconds depending on data volume
2. **Incremental Updates**: Subsequent syncs are faster (2-5 seconds)
3. **Batch Processing**: Multiple users can sync simultaneously
4. **Caching**: Recent queries are cached for faster responses

## Troubleshooting

### Common Issues

#### "Sync Failed" Error
1. Check if services are running:
   ```bash
   docker ps | grep -E "elysia|weaviate|postgres"
   ```

2. Check logs:
   ```bash
   docker logs finance-elysia --tail 50
   ```

3. Verify database connectivity:
   ```bash
   docker exec finance-elysia python -c "from data_sync import ElysiaDataSync; import asyncio; sync = ElysiaDataSync(); asyncio.run(sync.connect())"
   ```

#### "Not Synced" Status
1. Ensure user has data in PostgreSQL:
   ```bash
   docker exec finance-postgres psql -U financeuser -d financedb -c "SELECT COUNT(*) FROM \"Transaction\" WHERE user_id = 'YOUR_USER_ID';"
   ```

2. Manually trigger sync:
   ```bash
   docker exec finance-elysia python data_sync.py sync-all YOUR_USER_ID
   ```

#### Performance Issues
1. Check Weaviate health:
   ```bash
   curl http://localhost:8080/v1/.well-known/ready
   ```

2. Monitor resource usage:
   ```bash
   docker stats finance-elysia finance-weaviate
   ```

## Advanced Configuration

### Environment Variables
```bash
# In .env.docker or docker-compose.yml

# Database connection
DATABASE_URL=postgresql://user:pass@host:port/db

# Weaviate connection
WCD_URL=http://weaviate:8080
LOCAL_WEAVIATE_PORT=8080
LOCAL_WEAVIATE_GRPC_PORT=50051

# Sync configuration
SYNC_BATCH_SIZE=100
SYNC_TRANSACTION_LIMIT=500
SYNC_AUTO_ENABLED=true
SYNC_INTERVAL_HOURS=24
```

### Webhook Integration

For real-time updates with Plaid:

```typescript
// In your Plaid webhook handler
app.post('/webhook', async (req, res) => {
  const { webhook_type, user_id } = req.body;

  if (webhook_type === 'TRANSACTIONS') {
    // Trigger sync for new transactions
    await fetch('/api/v1/elysia/sync', {
      method: 'POST',
      body: JSON.stringify({
        user_id,
        sync_type: 'transactions'
      })
    });
  }
});
```

## Future Enhancements

- **Incremental Transaction Sync**: Only sync new transactions since last sync
- **Real-time Streaming**: WebSocket support for live updates
- **Multi-user Batch Sync**: Admin tools for bulk synchronization
- **Data Export**: Export synchronized data for backup/analysis
- **Custom Vectors**: User-defined embeddings for specialized analysis
- **Cross-user Insights**: Anonymous aggregate analysis (with consent)

## Support

For issues or questions:
1. Check the logs: `docker logs finance-elysia`
2. Review this documentation
3. Check the main [Elysia Integration Guide](./ELYSIA_INTEGRATION.md)
4. Submit issues to the project repository