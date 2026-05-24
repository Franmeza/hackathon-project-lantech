import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  fetchGmailMessage,
  getNewMessageIds,
  getAccountTokens,
} from "@/lib/gmail";
import { classifyEmail } from "@/lib/openai";
import { formatRelativeTime } from "@/lib/utils";

interface PubSubMessage {
  message?: {
    data?: string;
    messageId?: string;
  };
  subscription?: string;
}

interface GmailNotification {
  emailAddress?: string;
  historyId?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Acknowledge Pub/Sub immediately — must respond within 10s on Vercel Hobby.
  // Processing runs in the background via waitUntil so the response isn't held.
  let body: PubSubMessage;
  try {
    body = (await req.json()) as PubSubMessage;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const process = processNotification(body);

  // waitUntil keeps the function alive after the response is sent (Vercel/Next.js)
  // Falls back gracefully if the API isn't available (e.g. local dev)
  if (typeof (globalThis as Record<string, unknown>).EdgeRuntime === "undefined") {
    // Node.js runtime — fire and forget
    process.catch((err: unknown) => console.error("Webhook processing error:", err));
  }

  return NextResponse.json({ ok: true });
}

async function processNotification(body: PubSubMessage): Promise<void> {
  try {
    const encodedData = body?.message?.data;

    if (!encodedData) {
      return;
    }

    // Pub/Sub messages are base64-encoded JSON
    const notification = JSON.parse(
      Buffer.from(encodedData, "base64").toString("utf-8")
    ) as GmailNotification;

    const { emailAddress, historyId } = notification;

    if (!emailAddress || !historyId) {
      return;
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: emailAddress },
      select: { id: true },
    });

    if (!user) {
      console.warn(`Received webhook for unknown user: ${emailAddress}`);
      return;
    }

    // Get OAuth tokens for this user
    const tokens = await getAccountTokens(user.id);
    if (!tokens) {
      console.error(`No tokens found for user ${user.id}`);
      return;
    }

    const startHistoryId = tokens.historyId ?? historyId;

    // Fetch new message IDs since last known history
    const messageIds = await getNewMessageIds(
      startHistoryId,
      tokens.accessToken,
      tokens.refreshToken ?? undefined
    );

    // Process each new message
    for (const msgId of messageIds) {
      // Skip if already processed
      const existing = await prisma.card.findUnique({
        where: { gmailMsgId: msgId },
      });
      if (existing) continue;

      try {
        const email = await fetchGmailMessage(
          msgId,
          tokens.accessToken,
          tokens.refreshToken ?? undefined
        );

        const classification = await classifyEmail(
          email.from,
          email.subject,
          email.body
        );

        await prisma.card.upsert({
          where: { gmailMsgId: msgId },
          update: {},
          create: {
            userId: user.id,
            col: classification.col,
            sender: email.from,
            senderType: classification.senderType,
            time: formatRelativeTime(email.date),
            task: classification.task,
            reason: classification.reason,
            deadline: classification.deadline,
            reply: classification.reply,
            gmailMsgId: msgId,
          },
        });
      } catch (err) {
        console.error(`Failed to process message ${msgId}:`, err);
      }
    }

    // Update the stored historyId to the latest one
    await prisma.account.updateMany({
      where: { userId: user.id, provider: "google" },
      data: { gmailHistoryId: String(historyId) },
    });
  } catch (err) {
    console.error("Gmail webhook error:", err);
  }
}
