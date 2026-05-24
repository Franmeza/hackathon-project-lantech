import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { classifyEmail } from "@/lib/openai";
import { trashGmailMessage, getAccountTokens } from "@/lib/gmail";
import type { Card } from "@/types";

function serializeCard(card: {
  id: string;
  col: string;
  sender: string;
  senderType: string;
  time: string;
  task: string;
  reason: string;
  deadline: string | null;
  reply: string | null;
  archived: boolean;
  gmailMsgId: string | null;
  createdAt: Date;
}): Card {
  return {
    id: card.id,
    col: card.col as Card["col"],
    sender: card.sender,
    senderType: card.senderType as Card["senderType"],
    time: card.time,
    task: card.task,
    reason: card.reason,
    deadline: card.deadline,
    reply: card.reply,
    archived: card.archived,
    gmailMsgId: card.gmailMsgId,
    createdAt: card.createdAt.toISOString(),
  };
}

// GET /api/cards — return cards for the signed-in user
export async function GET(): Promise<NextResponse> {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await prisma.card.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cards.map(serializeCard));
}

// POST /api/cards — classify pasted text and create a new card
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = (await req.json()) as { text?: string };

  if (!text?.trim()) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  const classification = await classifyEmail(
    "Pasted message",
    "Manual entry",
    text
  );

  const card = await prisma.card.create({
    data: {
      userId: session.user.id,
      col: classification.col,
      sender: "Pasted message",
      senderType: classification.senderType,
      time: "Just now",
      task: classification.task,
      reason: classification.reason,
      deadline: classification.deadline,
      reply: classification.reply,
    },
  });

  return NextResponse.json(serializeCard(card), { status: 201 });
}

// PATCH /api/cards — update col or archived status
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    id?: string;
    col?: string;
    archived?: boolean;
  };

  if (!body.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const existing = await prisma.card.findFirst({
    where: { id: body.id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const card = await prisma.card.update({
    where: { id: body.id },
    data: {
      ...(body.col !== undefined && { col: body.col }),
      ...(body.archived !== undefined && { archived: body.archived }),
    },
  });

  return NextResponse.json(serializeCard(card));
}

// DELETE /api/cards?id=xxx         — delete a single card
// DELETE /api/cards?ids=x,y,z      — bulk delete
// Cards linked to Gmail are moved to trash; others are removed from DB only.
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const single = req.nextUrl.searchParams.get("id");
  const bulk   = req.nextUrl.searchParams.get("ids");
  const ids    = single ? [single] : (bulk?.split(",").filter(Boolean) ?? []);

  if (!ids.length) {
    return NextResponse.json({ error: "Missing id or ids" }, { status: 400 });
  }

  const cards = await prisma.card.findMany({
    where: { id: { in: ids }, userId: session.user.id },
    select: { id: true, gmailMsgId: true },
  });

  if (!cards.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Trash linked Gmail messages in parallel; failures are non-fatal
  const tokens = await getAccountTokens(session.user.id);
  if (tokens?.accessToken) {
    await Promise.all(
      cards
        .filter((c) => c.gmailMsgId)
        .map((c) =>
          trashGmailMessage(
            c.gmailMsgId!,
            tokens.accessToken,
            tokens.refreshToken ?? undefined,
            session.user.id
          ).catch((err) =>
            console.error(`Failed to trash Gmail message ${c.gmailMsgId}:`, err)
          )
        )
    );
  }

  await prisma.card.deleteMany({ where: { id: { in: cards.map((c) => c.id) } } });
  return NextResponse.json({ ok: true, deleted: cards.length });
}
