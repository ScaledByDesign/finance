# Elysia AI Integration Guide

## Overview

This document describes the integration of Elysia AI into the finance application. Elysia is an agentic framework powered by decision trees that provides advanced financial analysis capabilities using Weaviate vector database for intelligent data retrieval.

## Architecture

### Services Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Elysia API    │    │    Weaviate     │
│   (Port 3002)   │◄──►│   (Port 8000)   │◄──►│   (Port 8080)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│                      │                      │
│ • Chat Interface     │ • Decision Trees     │ • Vector Storage
│ • API Proxy          │ • Financial Tools    │ • Semantic Search
│ • User Management    │ • AI Analysis        │ • Data Collections
└─────────────────     └─────────────────     └─────────────────
```

### Docker Services

1. **weaviate**: Vector database for storing and searching financial data
2. **elysia**: Python-based AI analysis service
3. **app**: Next.js application with Elysia integration

## Configuration

### Environment Variables

#### .env.docker
```bash
# Elysia AI Configuration
ELYSIA_API_URL=http://elysia:8000
WEAVIATE_URL=http://weaviate:8080
OPENAI_API_KEY=your_openai_api_key

# Optional: Additional model providers
OPENROUTER_API_KEY=your_openrouter_api_key
```

#### elysia/.env
```bash
# Model Configuration
BASE_MODEL=gpt-4o-mini
BASE_PROVIDER=openai
COMPLEX_MODEL=gpt-4o
COMPLEX_PROVIDER=openai

# Weaviate Configuration
WEAVIATE_IS_LOCAL=true
WCD_URL=http://weaviate:8080
LOCAL_WEAVIATE_PORT=8080
LOCAL_WEAVIATE_GRPC_PORT=50051
```

## API Endpoints

### Elysia Service Endpoints

- `POST /analyze` - Main financial analysis endpoint
- `GET /health` - Health check
- `GET /collections` - List Weaviate collections
- `POST /preprocess` - Preprocess collections for analysis

### Next.js API Routes

- `POST /api/v1/elysia/analyze` - Proxy to Elysia analysis
- `GET /api/v1/elysia/health` - Check Elysia service health
- `GET /api/v1/elysia/collections` - Manage Weaviate collections

## Usage

### Frontend Integration

```typescript
import { useElysia } from '@/hooks/useElysia'

function FinancialAnalysis() {
  const { analyze, loading, error } = useElysia()

  const handleAnalysis = async () => {
    const result = await analyze({
      query: "Analyze my spending patterns and suggest optimizations",
      financial_data: userFinancialData,
      collection_names: ['UserTransactions', 'UserAccounts']
    })
    
    if (result) {
      console.log('Analysis:', result.response)
      console.log('Data objects:', result.objects)
    }
  }

  return (
    <button onClick={handleAnalysis} disabled={loading}>
      {loading ? 'Analyzing...' : 'Analyze Finances'}
    </button>
  )
}
```

### Chat Integration

The chat system automatically routes complex queries to Elysia:

```typescript
// Complex queries (automatically routed to Elysia)
"Analyze my spending patterns over the last 6 months"
"What investment recommendations do you have for my portfolio?"
"Optimize my budget allocation based on my goals"

// Simple queries (handled by standard chat)
"What's my account balance?"
"Show recent transactions"
"Hello"
```

## Financial Analysis Tools

Elysia includes custom financial analysis tools:

### 1. Spending Pattern Analysis
- Analyzes transaction history
- Identifies spending trends
- Provides optimization recommendations

### 2. Investment Analysis
- Portfolio risk assessment
- Diversification recommendations
- Performance analysis

### 3. Budget Optimization
- Income vs expense analysis
- Goal-based allocation
- Savings rate optimization

## Data Collections

### Weaviate Collections

1. **UserTransactions** - Transaction history and patterns
2. **UserAccounts** - Account information and balances
3. **FinancialGoals** - User financial objectives
4. **InvestmentData** - Portfolio and investment information

### Preprocessing

Collections must be preprocessed before use:

```bash
# Via API
POST /api/v1/elysia/collections
{
  "collection_names": ["UserTransactions", "UserAccounts"]
}

# Direct Elysia
from elysia import preprocess
preprocess(["UserTransactions"])
```

## Deployment

### Starting Services

```bash
# Start all services
docker-compose up -d

# Check service health
curl http://localhost:3002/api/v1/elysia/health

# View logs
docker-compose logs elysia
docker-compose logs weaviate
```

### Service Dependencies

1. **Weaviate** must start first (vector database)
2. **Elysia** depends on Weaviate being healthy
3. **App** depends on both Elysia and Weaviate

## Monitoring

### Health Checks

- Weaviate: `curl http://localhost:8080/v1/.well-known/ready`
- Elysia: `curl http://localhost:8000/health`
- Integration: `curl http://localhost:3002/api/v1/elysia/health`

### Logs

```bash
# Elysia logs
docker-compose logs -f elysia

# Weaviate logs
docker-compose logs -f weaviate

# Application logs
docker-compose logs -f app
```

## Troubleshooting

### Common Issues

1. **Elysia service not starting**
   - Check OpenAI API key is set
   - Verify Weaviate is healthy
   - Check Python dependencies

2. **Weaviate connection failed**
   - Ensure Weaviate container is running
   - Check port 8080 is available
   - Verify network connectivity

3. **Analysis requests failing**
   - Check Elysia health endpoint
   - Verify collections are preprocessed
   - Check API key quotas

### Debug Commands

```bash
# Check container status
docker-compose ps

# Test Elysia directly
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "test analysis", "user_id": "test@example.com"}'

# Check Weaviate collections
curl http://localhost:8080/v1/schema
```

## Development

### Adding Custom Tools

1. Edit `elysia/main.py`
2. Add new `@tool` decorated functions
3. Rebuild Elysia container

```python
@tool(tree=tree)
async def custom_analysis(data: dict) -> dict:
    # Your custom analysis logic
    return {"result": "analysis complete"}
```

### Testing

```bash
# Test Elysia service
cd elysia
python -m pytest tests/

# Test API integration
npm run test:api
```

## Security

- API keys are passed via environment variables
- User authentication required for all endpoints
- Weaviate runs in local mode (no external access)
- CORS configured for application domain only

## Performance

- Elysia uses GPT-4o-mini for fast decisions
- GPT-4o for complex analysis
- Weaviate provides sub-second vector search
- Results cached in Weaviate collections
