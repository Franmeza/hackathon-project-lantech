import { surfaces } from "@/lib/ui-tokens";
import { prisma } from "@/lib/db";
import { InboxBoard } from "@/components/Board/InboxBoard";
import { PLACEHOLDER_CARDS } from "@/lib/placeholder-cards";
import type { Card } from "@/types";

async function getInitialCards(): Promise<Card[]> {
  try {
    const cards = await prisma.card.findMany({
      orderBy: { createdAt: "desc" },
    });
    const mapped = cards.map((c) => ({
      id: c.id,
      col: c.col as Card["col"],
      sender: c.sender,
      senderType: c.senderType as Card["senderType"],
      time: c.time,
      task: c.task,
      reason: c.reason,
      deadline: c.deadline,
      reply: c.reply,
      archived: c.archived,
      gmailMsgId: c.gmailMsgId,
      createdAt: c.createdAt.toISOString(),
    }));
    // Show placeholder cards when the database has no real data yet
    return mapped.length > 0 ? mapped : PLACEHOLDER_CARDS;
  } catch {
    // DB not yet connected — show placeholder cards so the UI is usable
    return PLACEHOLDER_CARDS;
  }
}

export default async function HomePage() {
  const initialCards = await getInitialCards();

  return (
    <main className={"min-h-screen flex " + surfaces.page}>
      <InboxBoard initialCards={initialCards} />
    </main>
  );
}
