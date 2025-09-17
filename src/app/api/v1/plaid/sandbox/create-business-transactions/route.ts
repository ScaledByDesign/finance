import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);

    if (!session) {
      console.log("Warning: No session found, but proceeding for demo business transaction creation");
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

    // Clear existing transactions first
    await db.transaction.deleteMany({
      where: { userId: user.id }
    });

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

    console.log(`Creating business transactions for user ${user.id} with ${accounts.length} accounts`);

    // Create realistic business transactions
    const businessTransactions = [
      // Income/Revenue
      { name: "Client Payment - ABC Corp", amount: -12500.00, merchant: "ABC Corporation", category: ["Transfer", "Deposit", "Business Income"], channel: "wire" },
      { name: "Invoice #2024-089 Payment", amount: -8750.00, merchant: "XYZ Industries", category: ["Transfer", "Deposit", "Business Income"], channel: "ach" },
      { name: "Consulting Fee - Project Alpha", amount: -5500.00, merchant: "Tech Solutions Inc", category: ["Transfer", "Deposit", "Business Income"], channel: "wire" },
      { name: "Monthly Retainer - DEF Ltd", amount: -3500.00, merchant: "DEF Limited", category: ["Transfer", "Deposit", "Business Income"], channel: "ach" },
      { name: "Product Sale Revenue", amount: -2150.00, merchant: "Online Store", category: ["Transfer", "Deposit", "Sales"], channel: "online" },

      // Payroll & Benefits
      { name: "Payroll Processing", amount: 18500.00, merchant: "ADP Payroll", category: ["Transfer", "Payroll"], channel: "ach" },
      { name: "Employee Health Insurance", amount: 3200.00, merchant: "Blue Cross Blue Shield", category: ["Service", "Insurance"], channel: "ach" },
      { name: "401(k) Contribution", amount: 2100.00, merchant: "Vanguard", category: ["Transfer", "Benefits"], channel: "ach" },
      { name: "Payroll Taxes", amount: 4750.00, merchant: "IRS", category: ["Tax", "Payroll"], channel: "ach" },

      // Operating Expenses
      { name: "Office Rent - September", amount: 4500.00, merchant: "Commercial Properties LLC", category: ["Service", "Rent"], channel: "ach" },
      { name: "AWS Cloud Services", amount: 1247.89, merchant: "Amazon Web Services", category: ["Service", "Software", "Cloud"], channel: "online" },
      { name: "Google Workspace", amount: 450.00, merchant: "Google", category: ["Service", "Software", "SaaS"], channel: "online" },
      { name: "Slack Business Plan", amount: 312.50, merchant: "Slack", category: ["Service", "Software", "Communication"], channel: "online" },
      { name: "Adobe Creative Cloud", amount: 599.99, merchant: "Adobe", category: ["Service", "Software", "Design"], channel: "online" },
      { name: "Microsoft 365 Business", amount: 375.00, merchant: "Microsoft", category: ["Service", "Software", "Productivity"], channel: "online" },

      // Marketing & Advertising
      { name: "Google Ads Campaign", amount: 2500.00, merchant: "Google Ads", category: ["Service", "Marketing", "Advertising"], channel: "online" },
      { name: "LinkedIn Advertising", amount: 850.00, merchant: "LinkedIn", category: ["Service", "Marketing", "Social Media"], channel: "online" },
      { name: "Facebook Business Ads", amount: 1200.00, merchant: "Meta Business", category: ["Service", "Marketing", "Social Media"], channel: "online" },
      { name: "SEO Tools - Semrush", amount: 399.95, merchant: "Semrush", category: ["Service", "Marketing", "SEO"], channel: "online" },

      // Professional Services
      { name: "Legal Services - Contract Review", amount: 2500.00, merchant: "Smith & Associates Law", category: ["Service", "Legal"], channel: "check" },
      { name: "Accounting Services", amount: 1500.00, merchant: "Johnson CPA", category: ["Service", "Accounting"], channel: "ach" },
      { name: "Business Consulting", amount: 3000.00, merchant: "Strategy Partners", category: ["Service", "Consulting"], channel: "wire" },

      // Office & Supplies
      { name: "Office Supplies", amount: 487.23, merchant: "Staples", category: ["Shopping", "Office Supplies"], channel: "in store" },
      { name: "Computer Equipment", amount: 2899.00, merchant: "Apple Store", category: ["Shopping", "Equipment", "Technology"], channel: "online" },
      { name: "Office Furniture", amount: 1250.00, merchant: "Herman Miller", category: ["Shopping", "Furniture"], channel: "online" },

      // Utilities & Communications
      { name: "Internet Service - Fiber", amount: 299.00, merchant: "Verizon Business", category: ["Service", "Utilities", "Internet"], channel: "ach" },
      { name: "Mobile Phone Plan", amount: 450.00, merchant: "T-Mobile Business", category: ["Service", "Utilities", "Phone"], channel: "ach" },
      { name: "Electric Bill", amount: 685.47, merchant: "ConEd", category: ["Service", "Utilities", "Electric"], channel: "ach" },

      // Travel & Entertainment
      { name: "Business Travel - Flight", amount: 678.00, merchant: "Delta Airlines", category: ["Travel", "Transportation", "Air"], channel: "online" },
      { name: "Hotel - Conference", amount: 1456.00, merchant: "Marriott", category: ["Travel", "Lodging"], channel: "online" },
      { name: "Client Dinner", amount: 312.45, merchant: "The Capital Grille", category: ["Food and Drink", "Business Meals"], channel: "in store" },
      { name: "Uber Business", amount: 145.67, merchant: "Uber", category: ["Travel", "Transportation", "Taxi"], channel: "online" },

      // Subscriptions & Memberships
      { name: "Industry Association Dues", amount: 500.00, merchant: "Tech Alliance", category: ["Service", "Membership"], channel: "ach" },
      { name: "Coworking Space", amount: 650.00, merchant: "WeWork", category: ["Service", "Rent", "Coworking"], channel: "ach" },
      { name: "Business Insurance", amount: 1850.00, merchant: "State Farm Business", category: ["Service", "Insurance", "Liability"], channel: "ach" },
    ];

    const createdTransactions = [];
    const now = new Date();

    for (let i = 0; i < businessTransactions.length; i++) {
      const data = businessTransactions[i];
      const account = accounts[0]; // Use primary business account

      // Spread transactions over the last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const transactionDate = new Date(now);
      transactionDate.setDate(transactionDate.getDate() - daysAgo);

      // Add some random hours to make it more realistic
      transactionDate.setHours(Math.floor(Math.random() * 24));
      transactionDate.setMinutes(Math.floor(Math.random() * 60));

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
            pending: Math.random() > 0.9, // 10% pending
            transaction_id: `business_${Date.now()}_${i}`,
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

    // Calculate totals
    const totalIncome = businessTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpenses = businessTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    console.log(`Created ${createdTransactions.length} business transactions`);

    return NextResponse.json({
      message: `Successfully created ${createdTransactions.length} business transactions`,
      count: createdTransactions.length,
      summary: {
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        netIncome: totalIncome - totalExpenses
      },
      status: 200
    });

  } catch (error: any) {
    console.error("Error creating business transactions:", error);
    return NextResponse.json({
      message: error.message || "Error creating business transactions",
      status: 500
    });
  }
}

// Also support GET for easy testing
export async function GET() {
  return POST(new NextRequest("http://localhost/api/v1/plaid/sandbox/create-business-transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  }));
}
