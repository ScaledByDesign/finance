# Docker Setup Guide

This project is fully containerized with Docker Compose for easy development and deployment.

## 🚀 Quick Start

```bash
# 1. Start all services
docker-compose up -d

# 2. Watch logs (optional)
docker-compose logs -f

# 3. Access the application
# Open http://localhost:3000
```

## 📦 What's Included

- **Next.js Application** (Port 3000)
- **PostgreSQL Database** (Port 5432)
- **Redis Cache** (Port 6379)
- **LocalStripe** (Port 8420) - Mock Stripe API for testing

## 🛠️ Services Configuration

### PostgreSQL
- **Host**: localhost (from host) / postgres (from container)
- **Port**: 5432
- **Database**: financedb
- **Username**: financeuser
- **Password**: financepass123

### Redis
- **Host**: localhost (from host) / redis (from container)
- **Port**: 6380 (from host) / 6379 (internal)

### LocalStripe (Mock Stripe API)
- **Host**: localhost (from host) / localstripe (from container)
- **Port**: 8420
- **Dashboard**: http://localhost:8420
- **Test Cards**: All Stripe test cards work
- **Webhooks**: Automatically forwarded to app

## 📝 Environment Setup

### Required Setup (One-Time, 5 Minutes)

1. **Plaid Sandbox API** (FREE - Required for financial data)
   - Sign up at [dashboard.plaid.com/signup](https://dashboard.plaid.com/signup) (no credit card)
   - Get your FREE Sandbox credentials from Team Settings → Keys
   - Update `PLAID_CLIENT_ID` and `PLAID_SECRET` in `.env.docker`
   - See [PLAID_SANDBOX_GUIDE.md](./PLAID_SANDBOX_GUIDE.md) for detailed instructions
   - Test bank login: Username `user_good`, Password `pass_good`

2. **Stripe API** (Already configured with LocalStripe!)
   - LocalStripe provides a mock Stripe API for testing
   - No real Stripe account needed for development
   - Access dashboard at http://localhost:8420
   - For production, replace with real Stripe keys

### Already Configured
- ✅ Google OAuth
- ✅ OpenAI API
- ✅ NextAuth Secret
- ✅ Database Connection
- ✅ Redis/KV Store
- ✅ Stripe (via LocalStripe mock)

## 🔧 Useful Commands

```bash
# Start services
npm run docker:up

# Stop services
npm run docker:down

# Rebuild containers
npm run docker:build

# View logs
npm run docker:logs

# Database migrations
docker-compose exec app npx prisma migrate dev

# Open Prisma Studio
docker-compose exec app npx prisma studio

# Access PostgreSQL
docker-compose exec postgres psql -U financeuser -d financedb

# Access Redis CLI
docker-compose exec redis redis-cli

# LocalStripe - View all test data
curl http://localhost:8420/v1/customers

# LocalStripe - Create test customer
curl -X POST http://localhost:8420/v1/customers \
  -d "email=test@example.com"

# LocalStripe - Create test subscription
curl -X POST http://localhost:8420/v1/subscriptions \
  -d "customer=cus_xxx" \
  -d "items[0][price]=price_xxx"
```

## 🗄️ Database Management

### Run Migrations
```bash
# Create and apply migrations
docker-compose exec app npx prisma migrate dev --name init

# Apply existing migrations
docker-compose exec app npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
docker-compose exec app npx prisma migrate reset
```

### Prisma Studio
```bash
# Open GUI for database management
docker-compose exec app npx prisma studio
# Access at http://localhost:5555
```

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database connection issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres pg_isready

# Reset database
docker-compose down -v
docker-compose up -d
```

### Port conflicts
If ports are already in use, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change host port to 3001
```

## 🏗️ Development Workflow

1. **Make code changes** - Files are mounted, so changes reflect immediately
2. **Database changes** - Run migrations after schema changes
3. **Add dependencies** - Rebuild container after package.json changes:
   ```bash
   docker-compose build app
   docker-compose up -d app
   ```

## 🚢 Production Deployment

For production, use the optimized Dockerfile:
```bash
# Build production image
docker build -f Dockerfile -t finance-app:prod .

# Run with production env
docker run -p 3000:3000 --env-file .env.production finance-app:prod
```

## 📊 Monitoring

### View running containers
```bash
docker-compose ps
```

### Check resource usage
```bash
docker stats
```

### Clean up unused resources
```bash
docker system prune -a
```

## 🔒 Security Notes

- Default passwords are for development only
- Use strong passwords in production
- Never commit `.env` files with real credentials
- Use Docker secrets for production deployments