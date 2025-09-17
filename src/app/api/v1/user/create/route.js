import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "../../../../../lib/db";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({
        message: "No valid session found",
        status: 401,
      });
    }

    const { email, name, image } = session.user;

    // Create or update user in database
    const user = await db.user.upsert({
      where: { email },
      create: {
        email,
        name: name || 'User',
        image: image || null,
        given_name: name?.split(' ')[0] || 'User',
        family_name: name?.split(' ').slice(1).join(' ') || '',
        locale: 'en',
      },
      update: {
        name: name || 'User',
        image: image || null,
        given_name: name?.split(' ')[0] || 'User',
        family_name: name?.split(' ').slice(1).join(' ') || '',
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error('User creation error:', err);
    return NextResponse.json({
      message: err.message,
      status: 500,
    });
  }
}
