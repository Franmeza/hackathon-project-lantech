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
  try {
    const body = (await req.json()) as PubSubMessage;
    const encodedData = body?.message?.data;

    if (!encodedData) {
      return NextResponse.json({ error: "No data" }, { status: 400 });
    }

    // Pub/Sub messages are base64-encoded JSON
    const notification = JSON.parse(
      Buffer.from(encodedData, "base64").toString("utf-8")
    ) as GmailNotification;

    const { emailAddress, historyId } = notification;

    if (!emailAddress || !historyId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: emailAddress },
      select: { id: true },
    });

    if (!user) {
      console.warn(`Received webhook for unknown user: ${emailAddress}`);
      // Return 200 to prevent Pub/Sub retries for unknown users
      return NextResponse.json({ ok: true });
    }

    // Get OAuth tokens for this user
    const tokens = await getAccountTokens(user.id);
    if (!tokens) {
      console.error(`No tokens found for user ${user.id}`);
      return NextResponse.json({ ok: true });
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

        await prisma.card.create({
          data: {
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
      data: { gmailHistoryId: historyId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gmail webhook error:", err);
    // Return 200 to avoid Pub/Sub infinite retries on unexpected errors
    return NextResponse.json({ ok: true });
  }
}
