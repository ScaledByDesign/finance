import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const ELYSIA_API_URL = process.env.ELYSIA_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sync_type = 'all', limit = 500 } = body;

    // Call Elysia sync endpoint
    const syncResponse = await fetch(`${ELYSIA_API_URL}/sync/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: session.user.id,
        sync_type,
        limit,
      }),
    });

    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      console.error('Elysia sync failed:', errorText);
      return NextResponse.json(
        { error: 'Sync failed', details: errorText },
        { status: syncResponse.status }
      );
    }

    const result = await syncResponse.json();

    // Log sync activity
    console.log(`Data sync completed for user ${session.user.id}:`, result);

    return NextResponse.json({
      status: 'success',
      message: 'Data synchronized with Elysia',
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during sync' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sync status from Elysia
    const statusResponse = await fetch(
      `${ELYSIA_API_URL}/sync/status/${session.user.id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('Failed to get sync status:', errorText);
      return NextResponse.json(
        { error: 'Failed to get sync status', details: errorText },
        { status: statusResponse.status }
      );
    }

    const status = await statusResponse.json();

    return NextResponse.json({
      status: 'success',
      sync_status: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
