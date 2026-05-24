import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { registerGmailWatch } from "@/lib/gmail";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: env.nextAuthSecret,
  adapter: PrismaAdapter(prisma),
  events: {
    async signIn({ user, account, isNewUser }) {
      if (account?.provider === "google" && account.access_token) {
        // Always persist the latest tokens — PrismaAdapter v5 doesn't reliably
        // update tokens on re-authentication, so we do it explicitly here.
        await prisma.account.updateMany({
          where: { userId: user.id!, provider: "google" },
          data: {
            access_token: account.access_token,
            ...(account.refresh_token && { refresh_token: account.refresh_token }),
            ...(account.expires_at && { expires_at: account.expires_at }),
            scope: account.scope,
          },
        });

        try {
          await registerGmailWatch(
            user.id!,
            account.access_token,
            account.refresh_token ?? undefined
          );
        } catch (err) {
          console.error("Failed to register Gmail watch:", err);
        }
      }
      void isNewUser;
    },
  },
});
