import { auth } from "@/auth";
import { surfaces } from "@/lib/ui-tokens";
import { prisma } from "@/lib/db";
import { InboxBoard } from "@/components/Board/InboxBoard";
import type { Card } from "@/types";
import { redirect } from "next/navigation";

async function getUserCards(userId: string): Promise<Card[]> {
  const cards = await prisma.card.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return cards.map((c) => ({
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
}

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const initialCards = await getUserCards(session.user.id);

  return (
    <main className={"min-h-screen flex " + surfaces.page}>
      <InboxBoard
        initialCards={initialCards}
        userEmail={session.user.email ?? undefined}
      />
    </main>
  );
}
