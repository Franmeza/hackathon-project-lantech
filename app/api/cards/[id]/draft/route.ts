import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { generateDraftReply } from "@/lib/openai";
import { fetchGmailMessage, getAccountTokens } from "@/lib/gmail";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const card = await prisma.card.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Default context from stored card fields
  let from = card.sender;
  let subject = card.task;
  let body = `${card.task}\n\n${card.reason}`;

  // If the card came from Gmail, re-fetch the full email body
  if (card.gmailMsgId) {
    const tokens = await getAccountTokens(session.user.id);
    if (tokens?.accessToken) {
      try {
        const email = await fetchGmailMessage(
          card.gmailMsgId,
          tokens.accessToken,
          tokens.refreshToken ?? undefined,
          session.user.id
        );
        from = email.from;
        subject = email.subject;
        body = email.body;
      } catch (err) {
        console.error("Failed to re-fetch Gmail message for draft:", err);
        // Fall back to stored card data
      }
    }
  }

  const reply = await generateDraftReply(from, subject, body);

  // Persist the draft so it survives page refreshes
  await prisma.card.update({
    where: { id: card.id },
    data: { reply },
  });

  return NextResponse.json({ reply });
}
