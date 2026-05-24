import type { Card } from "@/types";

export type CardRow = {
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
};

export function serializeCard(card: CardRow): Card {
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
