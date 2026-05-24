import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { registerGmailWatch, getAccountTokens } from "@/lib/gmail";
import { env } from "@/lib/env";

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const userId = session.user.id;

  // Show current state
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: {
      access_token: true,
      refresh_token: true,
      scope: true,
      gmailHistoryId: true,
      gmailWatchExpiry: true,
      expires_at: true,
    },
  });

  const diagnostics = {
    userId,
    userEmail: session.user.email,
    googlePubsubTopic: env.googlePubsubTopic ?? "NOT SET ⚠️",
    account: account
      ? {
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          scope: account.scope,
          gmailHistoryId: account.gmailHistoryId,
          gmailWatchExpiry: account.gmailWatchExpiry,
          tokenExpiresAt: account.expires_at
            ? new Date(account.expires_at * 1000).toISOString()
            : null,
        }
      : "NO ACCOUNT FOUND ⚠️",
  };

  // Bail early if topic is missing
  if (!env.googlePubsubTopic) {
    return NextResponse.json({
      ...diagnostics,
      watchResult: "SKIPPED — GOOGLE_PUBSUB_TOPIC not set in env",
    });
  }

  const tokens = await getAccountTokens(userId);
  if (!tokens?.accessToken) {
    return NextResponse.json({
      ...diagnostics,
      watchResult: "FAILED — no access token found",
    });
  }

  // Try registering the watch and surface any error
  try {
    await registerGmailWatch(userId, tokens.accessToken, tokens.refreshToken ?? undefined);

    const updated = await prisma.account.findFirst({
      where: { userId, provider: "google" },
      select: { gmailHistoryId: true, gmailWatchExpiry: true },
    });

    return NextResponse.json({
      ...diagnostics,
      watchResult: "SUCCESS ✅",
      newHistoryId: updated?.gmailHistoryId,
      newWatchExpiry: updated?.gmailWatchExpiry,
    });
  } catch (err) {
    return NextResponse.json({
      ...diagnostics,
      watchResult: "ERROR ❌",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
