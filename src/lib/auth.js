import GoogleProvider from "next-auth/providers/google";
import apiCall from "@/utils/apiCall";

export const authOptions = {
    pages: {
        signIn: "/"
    },
    session: {
        strategy: "jwt"
        // maxAge: process.env.JWT_EXPIRE // 1 day
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    callbacks: {
        async signIn({ account, profile, user }) {
            if (account.provider === "google") {
                try {
                    // Import signInUser dynamically to avoid circular dependency
                    const { signInUser } = await import("@/server/user");
                    const res = await signInUser(profile);
                    user.isNewUser = res.isNewUser;
                    user.isPro = res.isPro;
                    user.isAdmin = res.isAdmin;
                } catch (err) {
                    console.log(err);
                }
                return true;
            }
            return false;
        },
        async jwt({ token, user, account, trigger, session, profile }) {
            if (user) {
                token = { user, accessToken: account.id_token };
                token.id = user.id;
                token.isPro = user.isPro;
            }
            if (trigger === "update") {
                token.user.isNewUser = session.isNewUser;
                token.user.isPro = session.isPro;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session = { ...session, ...token };
            return session;
        }
    }
};