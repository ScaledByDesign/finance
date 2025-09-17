import { NextResponse } from "next/server";
import { getUserInfo } from "../../../../../server/auth";
import db from "../../../../../lib/db";

export async function POST(req) {
  try {
    const { demoMode } = await req.json();

    // Try to get user info, but don't fail if no user exists
    let user;
    try {
      user = await getUserInfo();
    } catch (error) {
      user = null;
    }

    if (user) {
      // Update user's demo mode preference in database
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          demoModePreference: demoMode,
        },
      });
    }

    // Always return success - localStorage will handle the preference if no user exists
    return NextResponse.json({
      success: true,
      demoMode,
      userExists: !!user,
    });
  } catch (err) {
    console.error('Demo mode toggle error:', err);
    return NextResponse.json({
      message: err.message,
      status: 500,
    });
  }
}

export async function GET(req) {
  try {
    // Try to get user info, but don't fail if no user exists
    let user;
    try {
      user = await getUserInfo();
    } catch (error) {
      user = null;
    }

    if (!user) {
      // No user exists, return null preference
      return NextResponse.json({
        demoMode: null,
        userExists: false,
      });
    }

    // Get user's demo mode preference
    const userData = await db.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        demoModePreference: true,
      },
    });

    return NextResponse.json({
      demoMode: userData?.demoModePreference ?? null,
      userExists: true,
    });
  } catch (err) {
    console.error('Get demo mode preference error:', err);
    return NextResponse.json({
      message: err.message,
      status: 500,
    });
  }
}
