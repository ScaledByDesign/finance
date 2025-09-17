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

    const body = await req.json();
    const { webhook_code = "DEFAULT_UPDATE" } = body;

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
        message: "No items found to fire webhook for",
        status: 404
      });
    }

    console.log(`Firing webhook for ${items.length} items with code: ${webhook_code}`);

    // Fire webhook for each item
    const results = await Promise.all(
      items.map(async (item) => {
        try {
          // Prisma field is ACCESS_TOKEN
          const accessToken = item.ACCESS_TOKEN;

          if (!accessToken) {
            throw new Error("No access token found for item");
          }

          const response = await client.sandboxItemFireWebhook({
            access_token: accessToken,
            webhook_code: webhook_code
          });

          console.log(`Webhook fired for item ${item.id}: ${response.data.webhook_fired}`);

          return {
            itemId: item.id,
            success: true,
            webhook_fired: response.data.webhook_fired
          };
        } catch (error: any) {
          console.error(`Error firing webhook for item ${item.id}:`, error.message);
          return {
            itemId: item.id,
            success: false,
            error: error.message
          };
        }
      })
    );

    // Wait a moment for webhooks to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Now trigger a transaction sync to pull the new data
    try {
      const { transactionsSyncAll } = await import('@/server/plaid');
      const syncResult = await transactionsSyncAll();
      console.log("Transaction sync triggered after webhook:", syncResult);
    } catch (syncError) {
      console.error("Error syncing transactions after webhook:", syncError);
    }

    return NextResponse.json({
      message: "Sandbox webhooks fired successfully",
      results,
      status: 200
    });

  } catch (error: any) {
    console.error("Error in fire webhook endpoint:", error);
    return NextResponse.json({
      message: error.message || "Error firing sandbox webhook",
      status: 500
    });
  }
}

// Also support GET for easy testing
export async function GET() {
  return POST(new NextRequest("http://localhost/api/v1/plaid/sandbox/fire-webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ webhook_code: "DEFAULT_UPDATE" })
  }));
}
