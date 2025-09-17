"use server"

import { getServerSession } from "next-auth";
import db from "../lib/db";

// signIn function has been moved to user.js to avoid circular dependency

export const getUserInfo = async () => {
  // Import authOptions dynamically to avoid circular dependency
  const { authOptions } = await import("@/lib/auth");
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    console.log('getUserInfo: No valid session found');
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    console.log('getUserInfo: No user found for email:', session.user.email);
    return null;
  }

  return user;
}