import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  fetchGmailMessage,
  getNewMessageIds,
  getAccountTokens,
} from "@/lib/gmail";
import { classifyEmail } from "@/lib/openai";
import { formatRelativeTime } from "@/lib/utils";

// Tell Vercel to allow up to 60 seconds for this function (requires Pro for >10s,
// but on Hobby the max is 60s on Edge — we stay in Node.js and cap at 60s)
export const maxDuration = 60;

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
  let body: PubSubMessage;
  try {
    body = (await req.json()) as PubSubMessage;
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    const encodedData = body?.message?.data;
    if (!encodedData) return NextResponse.json({ ok: true });

    const notification = JSON.parse(
      Buffer.from(encodedData, "base64").toString("utf-8")
    ) as GmailNotification;

    const { emailAddress, historyId } = notification;
    if (!emailAddress || !historyId) return NextResponse.json({ ok: true });

    const user = await prisma.user.findUnique({
      where: { email: emailAddress },
      select: { id: true },
    });

    if (!user) {
      console.warn(`Webhook: unknown user ${emailAddress}`);
      return NextResponse.json({ ok: true });
    }

    const tokens = await getAccountTokens(user.id);
    if (!tokens) {
      console.error(`Webhook: no tokens for user ${user.id}`);
      return NextResponse.json({ ok: true });
    }

    const startHistoryId = tokens.historyId ?? historyId;

    const messageIds = await getNewMessageIds(
      startHistoryId,
      tokens.accessToken,
      tokens.refreshToken ?? undefined,
      user.id
    );

    for (const msgId of messageIds) {
      const existing = await prisma.card.findUnique({
        where: { gmailMsgId: msgId },
      });
      if (existing) continue;

      try {
        const email = await fetchGmailMessage(
          msgId,
          tokens.accessToken,
          tokens.refreshToken ?? undefined,
          user.id
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
        console.error(`Webhook: failed to process message ${msgId}:`, err);
      }
    }

    await prisma.account.updateMany({
      where: { userId: user.id, provider: "google" },
      data: { gmailHistoryId: String(historyId) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
