import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);

    // For development, allow without session but log warning
    if (!session) {
      console.log("Warning: No session found, but proceeding for demo transaction creation");
    }

    // Get a user and account to associate transactions with
    const user = session?.user?.id
      ? await db.user.findUnique({ where: { id: session.user.id } })
      : await db.user.findFirst();

    if (!user) {
      return NextResponse.json({
        message: "No user found to create transactions for",
        status: 404
      });
    }

    // Get accounts for this user
    const accounts = await db.account.findMany({
      where: {
        item: {
          userId: user.id
        }
      },
      take: 3
    });

    if (accounts.length === 0) {
      return NextResponse.json({
        message: "No accounts found to create transactions for",
        status: 404
      });
    }

    console.log(`Creating demo transactions for user ${user.id} with ${accounts.length} accounts`);

    // Create sample transactions
    const transactionData = [
      { name: "Spotify", amount: 9.99, merchant: "Spotify", category: ["Transfer", "Debit"], channel: "online" },
      { name: "Amazon Purchase", amount: 45.67, merchant: "Amazon", category: ["Shopping"], channel: "online" },
      { name: "Whole Foods", amount: 89.23, merchant: "Whole Foods", category: ["Food and Drink", "Shops"], channel: "in store" },
      { name: "Netflix", amount: 15.99, merchant: "Netflix", category: ["Transfer", "Debit"], channel: "online" },
      { name: "Uber", amount: 23.45, merchant: "Uber", category: ["Travel", "Taxi"], channel: "online" },
      { name: "Starbucks", amount: 5.75, merchant: "Starbucks", category: ["Food and Drink", "Coffee Shop"], channel: "in store" },
      { name: "Target", amount: 112.34, merchant: "Target", category: ["Shopping", "Shops"], channel: "in store" },
      { name: "Gas Station", amount: 45.00, merchant: "Shell", category: ["Travel", "Gas Stations"], channel: "in store" },
      { name: "Restaurant Payment", amount: 67.89, merchant: "Local Restaurant", category: ["Food and Drink", "Restaurants"], channel: "in store" },
      { name: "Gym Membership", amount: 50.00, merchant: "Planet Fitness", category: ["Recreation", "Gyms and Fitness Centers"], channel: "online" },
      { name: "Apple Store", amount: 199.99, merchant: "Apple", category: ["Shopping", "Electronics"], channel: "online" },
      { name: "CVS Pharmacy", amount: 23.45, merchant: "CVS", category: ["Shops", "Pharmacies"], channel: "in store" },
      { name: "Electric Bill", amount: 125.00, merchant: "ConEd", category: ["Service", "Utilities"], channel: "online" },
      { name: "Internet Bill", amount: 79.99, merchant: "Spectrum", category: ["Service", "Telecommunication Services"], channel: "online" },
      { name: "Direct Deposit", amount: -2500.00, merchant: "Employer", category: ["Transfer", "Deposit"], channel: "other" },
    ];

    const createdTransactions = [];
    const now = new Date();

    for (let i = 0; i < transactionData.length; i++) {
      const data = transactionData[i];
      const account = accounts[i % accounts.length]; // Rotate through accounts
      const daysAgo = Math.floor(i * 2); // Spread transactions over time
      const transactionDate = new Date(now);
      transactionDate.setDate(transactionDate.getDate() - daysAgo);

      try {
        const transaction = await db.transaction.create({
          data: {
            userId: user.id,
            account_id: account.account_id,
            name: data.name,
            amount: data.amount,
            date: transactionDate,
            merchant_name: data.merchant,
            category: data.category,
            payment_channel: data.channel,
            iso_currency_code: "USD",
            pending: false,
            transaction_id: `demo_${Date.now()}_${i}`,
            personal_finance_category: {
              create: {
                primary: data.category[0],
                detailed: data.category.join(" > ")
              }
            }
          }
        });
        createdTransactions.push(transaction);
      } catch (error) {
        console.error(`Error creating transaction ${data.name}:`, error);
      }
    }

    console.log(`Created ${createdTransactions.length} demo transactions`);

    return NextResponse.json({
      message: `Successfully created ${createdTransactions.length} demo transactions`,
      count: createdTransactions.length,
      status: 200
    });

  } catch (error: any) {
    console.error("Error creating demo transactions:", error);
    return NextResponse.json({
      message: error.message || "Error creating demo transactions",
      status: 500
    });
  }
}

// Also support GET for easy testing
export async function GET() {
  return POST(new NextRequest("http://localhost/api/v1/plaid/sandbox/create-demo-transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  }));
}
