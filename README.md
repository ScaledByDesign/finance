# Shadcn AI Personal Finance Dashboard
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). This project utilizes `Plaid` and `OpenAI` technologies as well as `shadcn` to unlock insights into your spending and transactions. Simply clone and deploy with your own Plaid Developer API Key to host a private Mint App clone, boosted with `Vercel AI SDK` & `Generative UI`. Take it forward, contribute or commercialize - go nuts.

 ![screenrun-12-10-2024-03-35-21 (1) (1)](https://github.com/user-attachments/assets/cf46f89f-3284-47f2-9b2c-6365aa3db8ec)


## Key Features
- `/dashboard` Connect Debit / Checkings, Savings, Credit Cards & Investment (Robinhood) accounts. Review live account balances.

![screenrun-12-11-2024-06-39-46](https://github.com/user-attachments/assets/9a5e258b-2b16-4375-8694-f917dadfb2fa)
- `charts` Shadcn charts to analyze monthly and recurring spend.

![screenrun-12-11-2024-06-41-17](https://github.com/user-attachments/assets/aa89746a-b115-437d-8c76-fb3e5a5e3079)
- `transactions` Rich Datagrid to browse transactions and filter by time-range, spend category & more using shadcn data grid and popover filters.

![screenrun-12-11-2024-06-47-21](https://github.com/user-attachments/assets/4e996235-9c5c-44b9-a0db-f1cb3ccdc161)
- `chat` Chat with GPT-4o to ask Q&A about your accounts & financial position. Renders generative UI cards using Vercel AI SDK.

![screenrun-12-11-2024-06-43-42](https://github.com/user-attachments/assets/77b656a5-53c4-4a32-9336-ba600550bbee)

- NEW `Custom GPT Integration` Serve secure endpoints to inferace with Plaid & ChatGPT. Utilize the pre-populated OpenAPI specification and securely chat with your account and transactions data in ChatGPT.
  
![Screenshot 2024-12-11 at 12 13 18 PM](https://github.com/user-attachments/assets/ebc01580-9eee-40ac-a5ae-13a46ea34078)

## Roadmap / Future Plans
- [ ] Add more charts
- [ ] Add loading states
- [ ] Budgeting feature like [RangerBudget](https://rangerbudget.com/)
- [ ] Twilio integration for SMS notifications
- [ ] Vapi or OpenAI realtime integration for voice AI
- [ ] Review Investments
- [ ] Check Credit Score
- [ ] Check Credit Card Rewards

## Getting Started

### 🐳 Docker Setup (Recommended)

The easiest way to get started is with Docker Compose, which includes everything you need:

```bash
# 1. Get your FREE Plaid Sandbox credentials (5 minutes)
#    Sign up at: https://dashboard.plaid.com/signup
#    Add credentials to .env.docker

# 2. Start all services (PostgreSQL, Redis, LocalStripe, and the app)
docker-compose up -d

# 3. Initialize database (first time only)
docker-compose exec app npx prisma migrate dev --name init

# 4. (Optional) Initialize Stripe test data
npm run docker:stripe-init

# 5. Open the app
#    Visit http://localhost:3000
```

**Included Services:**
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ LocalStripe (mock Stripe API)
- ✅ Next.js app with hot-reload

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for detailed instructions and [PLAID_SANDBOX_GUIDE.md](./PLAID_SANDBOX_GUIDE.md) for Plaid setup.

### Manual Setup

If you prefer to run without Docker:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

![screenrun-12-10-2024-03-32-18](https://github.com/user-attachments/assets/bd238347-4293-47d3-8a04-40750f3b4ad7)
