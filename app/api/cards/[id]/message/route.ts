import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { fetchGmailMessage, getAccountTokens } from "@/lib/gmail";

export const maxDuration = 30;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const card = await prisma.card.findFirst({
    where: { id, userId: session.user.id },
    select: { gmailMsgId: true },
  });

  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!card.gmailMsgId) {
    return NextResponse.json({ error: "No Gmail message linked to this card" }, { status: 422 });
  }

  const tokens = await getAccountTokens(session.user.id);
  if (!tokens?.accessToken) {
    return NextResponse.json({ error: "Gmail not authorized" }, { status: 403 });
  }

  try {
    const email = await fetchGmailMessage(
      card.gmailMsgId,
      tokens.accessToken,
      tokens.refreshToken ?? undefined,
      session.user.id,
      { includeHtml: true }
    );
    return NextResponse.json(email);
  } catch (err) {
    console.error("Failed to fetch Gmail message:", err);
    return NextResponse.json({ error: "Failed to fetch message" }, { status: 502 });
  }
}
