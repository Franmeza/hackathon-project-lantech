import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { classifyEmail } from "@/lib/openai";
import { PLACEHOLDER_CARDS } from "@/lib/placeholder-cards";
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

// GET /api/cards — return all cards; fall back to placeholders when DB is empty/unavailable
export async function GET(): Promise<NextResponse> {
  try {
    const cards = await prisma.card.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (cards.length === 0) {
      return NextResponse.json(PLACEHOLDER_CARDS);
    }
    return NextResponse.json(cards.map(serializeCard));
  } catch {
    return NextResponse.json(PLACEHOLDER_CARDS);
  }
}

// POST /api/cards — classify pasted text and create a new card
export async function POST(req: NextRequest): Promise<NextResponse> {
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
  const body = (await req.json()) as {
    id?: string;
    col?: string;
    archived?: boolean;
  };

  if (!body.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
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

// DELETE /api/cards?id=xxx — permanently delete a card
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.card.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
