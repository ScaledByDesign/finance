import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { client } from "@/server/plaid";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any);

    // For development, allow without session but log warning
    if (!session) {
      console.log("Warning: No session found, but proceeding for sandbox testing");
    }

    // Get all items for the current user or any user (for testing)
    let items;
    if (session?.user?.id) {
      items = await db.item.findMany({
        where: { userId: session.user.id }
      });
    } else {
      // For testing, get all items
      items = await db.item.findMany({
        take: 5 // Limit to prevent too many API calls
      });
    }

    if (items.length === 0) {
      return NextResponse.json({
        message: "No items found to refresh transactions for",
        status: 404
      });
    }

    console.log(`Refreshing transactions for ${items.length} items`);

    // Refresh transactions for each item
    const results = await Promise.all(
      items.map(async (item) => {
        try {
          // Prisma field is ACCESS_TOKEN
          const accessToken = item.ACCESS_TOKEN;

          if (!accessToken) {
            throw new Error("No access token found for item");
          }

          // Use transactions/refresh to force a refresh of transaction data
          const response = await client.transactionsRefresh({
            access_token: accessToken
          });

          console.log(`Transactions refresh initiated for item ${item.id}`);

          return {
            itemId: item.id,
            success: true,
            request_id: response.data.request_id
          };
        } catch (error: any) {
          console.error(`Error refreshing transactions for item ${item.id}:`, error.response?.data || error.message);
          return {
            itemId: item.id,
            success: false,
            error: error.response?.data?.error_message || error.message
          };
        }
      })
    );

    // Wait a moment for the refresh to process
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Now trigger a transaction sync to pull the refreshed data
    try {
      const { transactionsSyncAll } = await import('@/server/plaid');
      const syncResult = await transactionsSyncAll();
      console.log("Transaction sync triggered after refresh:", syncResult);
    } catch (syncError) {
      console.error("Error syncing transactions after refresh:", syncError);
    }

    return NextResponse.json({
      message: "Transactions refresh initiated successfully",
      results,
      status: 200
    });

  } catch (error: any) {
    console.error("Error in transactions refresh endpoint:", error);
    return NextResponse.json({
      message: error.message || "Error refreshing transactions",
      status: 500
    });
  }
}

// Also support GET for easy testing
export async function GET() {
  return POST(new NextRequest("http://localhost/api/v1/plaid/transactions/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  }));
}
