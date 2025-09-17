import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Check if demo mode is enabled
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
                   !process.env.PLAID_CLIENT_ID ||
                   !process.env.PLAID_SECRET ||
                   process.env.PLAID_CLIENT_ID === 'your_sandbox_client_id_here';

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const { token } = req.nextauth;

        // Allow access in demo mode without authentication
        if (isDemoMode) {
            return NextResponse.next();
        }

        // Allow access to transaction page even without auth (will show empty state)
        if (pathname.includes("/dashboard/transaction")) {
            return NextResponse.next();
        }

        // Check if token and user exist in the token object
        if (!token || !token.user) {
            // Redirect to login or an unauthorized page as there's no user info
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        const user  = token.user;

        // // Check if the user is accessing either the checkout or settings page
        // const isAccessingAllowedPage = pathname.includes("/dashboard/checkout") || pathname.includes("/dashboard/setting");
        
        // console.log("Hawk Plan:", user);
        // // Allow access if user is a pro or is accessing allowed pages
        // if (user.isPro === true || isAccessingAllowedPage) {
        //     return NextResponse.next();
        // }

        // // Redirect non-pro users trying to access other dashboard pages to checkout
        // return NextResponse.redirect(new URL("/dashboard/checkout", req.url));
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                // Allow access in demo mode without token
                if (isDemoMode) return true;
                return token?.accessToken;
            }
        }
    }
);

export const config = {
    matcher: "/dashboard/:path*"
};
