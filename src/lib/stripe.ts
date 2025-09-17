import "server-only";

import Stripe from "stripe";

// Configure Stripe with optional custom API base for LocalStripe
const stripeConfig: Stripe.StripeConfig = {
    apiVersion: "2023-10-16",
    appInfo: {
        name: "finance gpt stripe project by dragonknight0522",
        url: "https://app.qashboard.com"
    }
};

// Use custom API base if provided (for LocalStripe in Docker)
if (process.env.STRIPE_API_BASE) {
    const url = new URL(process.env.STRIPE_API_BASE);
    stripeConfig.host = url.hostname;
    stripeConfig.protocol = url.protocol.replace(':', '') as 'http' | 'https';
    stripeConfig.port = url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80);
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, stripeConfig);
