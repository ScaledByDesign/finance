# Elysia AI Backend for Finance Application

This directory contains the Elysia AI backend integration for advanced financial analysis using decision trees and Weaviate vector database.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- OpenAI API key
- Finance application running

### Setup

1. **Ensure environment variables are set in `.env.docker`:**
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   ELYSIA_API_URL=http://elysia:8000
   WEAVIATE_URL=http://weaviate:8080
   ```

2. **Start all services:**
   ```bash
   # From project root
   ./scripts/setup-elysia.sh
   ```

3. **Verify installation:**
   ```bash
   # Test Elysia directly
   docker exec -it finance-elysia python test_integration.py
   
   # Test via API
   curl http://localhost:3002/api/v1/elysia/health
   ```

## 🏗️ Architecture

### Components

- **FastAPI Server** (`main.py`) - REST API for financial analysis
- **Elysia Framework** - Decision tree-based AI agent
- **Custom Financial Tools** - Specialized analysis functions
- **Weaviate Integration** - Vector database for semantic search

### API Endpoints

- `POST /analyze` - Main financial analysis endpoint
- `GET /health` - Service health check
- `GET /collections` - List Weaviate collections
- `POST /preprocess` - Preprocess collections for analysis

## 🔧 Configuration

### Environment Variables

```bash
# Model Configuration
BASE_MODEL=gpt-4o-mini          # Fast model for decisions
BASE_PROVIDER=openai
COMPLEX_MODEL=gpt-4o            # Powerful model for analysis
COMPLEX_PROVIDER=openai
OPENAI_API_KEY=your_key

# Weaviate Configuration
WEAVIATE_IS_LOCAL=true
WCD_URL=http://weaviate:8080
LOCAL_WEAVIATE_PORT=8080
LOCAL_WEAVIATE_GRPC_PORT=50051

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

### Custom Tools

The backend includes specialized financial analysis tools:

1. **Spending Pattern Analysis**
   - Transaction categorization
   - Trend identification
   - Optimization recommendations

2. **Investment Analysis**
   - Portfolio risk assessment
   - Diversification analysis
   - Performance recommendations

3. **Budget Optimization**
   - Income vs expense analysis
   - Goal-based allocation
   - Savings rate optimization

## 📊 Usage Examples

### Basic Analysis Request

```python
import httpx

response = httpx.post("http://localhost:8000/analyze", json={
    "query": "Analyze my spending patterns over the last 3 months",
    "financial_data": {
        "transactions": [...],
        "accounts": [...]
    },
    "collection_names": ["UserTransactions"],
    "user_id": "user@example.com"
})

result = response.json()
print(result["response"])  # AI analysis
print(result["objects"])   # Retrieved data
```

### Via Next.js API

```typescript
const response = await fetch('/api/v1/elysia/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "What investment recommendations do you have for my portfolio?",
    financial_data: userFinancialData
  })
})

const analysis = await response.json()
```

## 🧪 Testing

### Run Integration Tests

```bash
# Inside container
docker exec -it finance-elysia python test_integration.py

# Or locally (if Python 3.12+ installed)
cd elysia
pip install -r requirements.txt
python test_integration.py
```

### Manual Testing

```bash
# Health check
curl http://localhost:8000/health

# Simple analysis
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "test analysis", "user_id": "test@example.com"}'

# Collections
curl http://localhost:8000/collections
```

## 🔍 Monitoring

### Health Checks

```bash
# Service health
curl http://localhost:8000/health

# Weaviate health
curl http://localhost:8080/v1/.well-known/ready

# Integration health
curl http://localhost:3002/api/v1/elysia/health
```

### Logs

```bash
# View Elysia logs
docker-compose logs -f elysia

# View all service logs
docker-compose logs -f
```

## 🛠️ Development

### Adding Custom Tools

1. Edit `main.py`
2. Add new `@tool` decorated functions:

```python
@tool(tree=tree)
async def custom_financial_analysis(data: dict) -> dict:
    """Your custom analysis logic"""
    return {"analysis": "Custom result"}
```

3. Rebuild container:
```bash
docker-compose up -d --build elysia
```

### Debugging

```bash
# Access container shell
docker exec -it finance-elysia bash

# Check Python environment
docker exec -it finance-elysia python -c "import elysia; print('Elysia imported successfully')"

# View container logs
docker logs finance-elysia
```

## 📚 Dependencies

### Core Dependencies

- `elysia-ai>=0.2.6` - Main framework
- `fastapi>=0.104.0` - Web framework
- `uvicorn[standard]>=0.24.0` - ASGI server
- `httpx>=0.25.0` - HTTP client

### Optional Dependencies

- `openai>=1.3.0` - OpenAI integration (included in elysia-ai)
- `anthropic>=0.7.0` - Anthropic Claude support
- `cohere>=4.0.0` - Cohere model support

## 🚨 Troubleshooting

### Common Issues

1. **Service won't start**
   ```bash
   # Check OpenAI API key
   docker exec -it finance-elysia env | grep OPENAI
   
   # Check Weaviate connection
   docker exec -it finance-elysia curl http://weaviate:8080/v1/.well-known/ready
   ```

2. **Analysis requests fail**
   ```bash
   # Check service health
   curl http://localhost:8000/health
   
   # Check logs for errors
   docker logs finance-elysia
   ```

3. **Weaviate connection issues**
   ```bash
   # Verify Weaviate is running
   docker ps | grep weaviate
   
   # Check Weaviate logs
   docker logs finance-weaviate
   ```

### Debug Mode

Enable debug logging:

```bash
# Add to .env
LOG_LEVEL=DEBUG

# Restart service
docker-compose restart elysia
```

## 🔒 Security

- API keys passed via environment variables only
- No API keys stored in code or logs
- Weaviate runs in local mode (no external access)
- All endpoints require authentication via Next.js proxy

## 📈 Performance

- Uses GPT-4o-mini for fast decision making
- GPT-4o for complex analysis requiring reasoning
- Weaviate provides sub-second vector search
- Async processing for concurrent requests
- Results can be cached in Weaviate collections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your financial analysis tools
4. Test thoroughly
5. Submit a pull request

## 📄 License

This integration follows the same license as the main finance application.
