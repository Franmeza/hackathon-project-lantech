import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { registerGmailWatch } from "@/lib/gmail";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Register Gmail push notifications on first sign-in or when a new OAuth token is granted
      if (account?.provider === "google" && account.access_token) {
        try {
          await registerGmailWatch(
            user.id!,
            account.access_token,
            account.refresh_token ?? undefined
          );
        } catch (err) {
          // Non-fatal: watch registration can be retried later
          console.error("Failed to register Gmail watch:", err);
        }
      }
      void isNewUser; // suppress unused warning
    },
  },
});
