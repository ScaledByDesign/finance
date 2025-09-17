# Plaid Sandbox Setup Guide

## 🎯 Quick Setup (5 minutes)

### 1. Get Your Free Sandbox Credentials

1. Go to [dashboard.plaid.com/signup](https://dashboard.plaid.com/signup)
2. Sign up for a **FREE** account (no credit card required)
3. Once logged in, go to **Team Settings → Keys**
4. Copy your **Sandbox** credentials:
   - `client_id`
   - `secret`

### 2. Add Credentials to Docker Environment

Edit `.env.docker` and replace the placeholders:

```env
PLAID_CLIENT_ID=your_actual_client_id_here
PLAID_SECRET=your_actual_secret_here
```

### 3. Restart Docker Services

```bash
docker-compose down
docker-compose up -d
```

## 🏦 Test Bank Accounts

When connecting accounts in the app, use these test credentials:

### Standard Test Accounts

| Institution | Username | Password | Description |
|------------|----------|----------|-------------|
| Any Bank | `user_good` | `pass_good` | Standard test account with transactions |
| Any Bank | `user_custom` | Any password | Customizable test account |
| Chase | `user_good` | `pass_good` | Chase-specific test data |
| Bank of America | `user_good` | `pass_good` | BoA-specific test data |
| Wells Fargo | `user_good` | `pass_good` | WF-specific test data |

### Specialized Test Users

| Username | Password | Use Case |
|----------|----------|----------|
| `user_transactions_dynamic` | Any | Dynamic transaction generation |
| `user_investments` | `pass_good` | Investment accounts (Robinhood, etc.) |
| `user_credit` | `pass_good` | Credit card accounts |
| `user_income` | `pass_good` | Income verification testing |

## 📊 What Sandbox Provides

- ✅ **Unlimited test bank connections**
- ✅ **Realistic transaction data**
- ✅ **All Plaid products** (Transactions, Auth, Identity, Assets, etc.)
- ✅ **Webhook testing**
- ✅ **Error simulation**
- ✅ **Custom test scenarios**

## 🧪 Testing Workflow

1. **Connect a Test Bank**
   - Click "Connect Account" in the app
   - Search for any bank (Chase, BoA, etc.)
   - Use credentials: `user_good` / `pass_good`

2. **View Test Data**
   - Transactions appear immediately
   - Balances update in real-time
   - Categories are pre-populated

3. **Test Different Scenarios**
   ```bash
   # Simulate webhook
   curl -X POST http://localhost:3000/api/webhooks/plaid \
     -H "Content-Type: application/json" \
     -d '{"webhook_type":"TRANSACTIONS","webhook_code":"DEFAULT_UPDATE"}'
   ```

## 🛠️ Troubleshooting

### "Invalid credentials" error
- Double-check your client_id and secret in `.env.docker`
- Ensure you're using **Sandbox** credentials, not Development or Production

### No transactions showing
- Use `user_good` / `pass_good` for guaranteed transaction data
- Wait a few seconds for initial sync

### Connection fails
- Check Docker logs: `docker-compose logs app`
- Verify Plaid service status: [status.plaid.com](https://status.plaid.com)

## 📚 Additional Resources

- [Plaid Sandbox Documentation](https://plaid.com/docs/sandbox/)
- [Test Credentials Reference](https://plaid.com/docs/sandbox/test-credentials/)
- [Webhook Testing](https://plaid.com/docs/api/webhooks/)
- [Error Simulation](https://plaid.com/docs/errors/testing/)

## 💡 Pro Tips

1. **Test Multiple Banks**: Different banks return different data formats
2. **Use Custom Users**: `user_custom` lets you define specific scenarios
3. **Test Errors**: Use `user_error` to test error handling
4. **Check Webhooks**: Monitor webhook events in your app logs
5. **Free Forever**: Sandbox is always free, no limits!

## 🔄 Switching to Production

When ready for real bank connections:

1. Get Production credentials from Plaid Dashboard
2. Update `.env` with production keys
3. Change `PLAID_ENV=sandbox` to `PLAID_ENV=production`
4. Deploy with proper security measures

---

**Note**: The Sandbox environment is perfect for development and testing. It provides the full Plaid experience without touching real bank accounts!