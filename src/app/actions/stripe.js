"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { APP_PRICE, CURRENCY } from "@/lib/config";
import { formatAmountForStripe } from "@/utils/stripe-helpers";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFullUserInfo, updateUserInfoServerSide } from "@/app/actions/user";

export async function createCheckoutSession() {
    const { user } = await getServerSession(authOptions);
    const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: user.email,
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: CURRENCY,
                    product_data: {
                        name: "Subscribe to Qashboard"
                    },
                    unit_amount: formatAmountForStripe(Number(APP_PRICE), CURRENCY),
                    recurring: {
                        interval: "month"
                    }
                }
            }
        ],
        success_url: `${headers().get(
            "origin"
        )}/dashboard/checkout/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${headers().get("origin")}/dashboard/checkout?canceled=true`
    });

    redirect(checkoutSession.url);
}

export async function cancelCheckoutSession() {
    const { user } = await getFullUserInfo();
    const deleted = await stripe.subscriptions.cancel(user.subscription);

    if (deleted.status === "canceled") {
        await updateUserInfoServerSide({
            userInfo: { isPro: false, subscription: null }
        });
        redirect("/");
    }
}
