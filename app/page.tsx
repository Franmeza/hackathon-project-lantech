import { auth } from "@/auth";
import { serializeCard } from "@/lib/card-serializer";
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

  return cards.map(serializeCard);
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
        userName={session.user.name ?? undefined}
        userEmail={session.user.email ?? undefined}
      />
    </main>
  );
}
