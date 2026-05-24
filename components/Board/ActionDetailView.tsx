"use client";

import type { Card, ColConfigMap } from "@/types";
import { EmailCard } from "@/components/Card/EmailCard";
import { ColumnHeader } from "@/components/ui/ColumnHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { actionGroupHeaders } from "@/lib/ui-tokens";

interface ActionDetailViewProps {
  cards: Card[];
  colConfig: ColConfigMap;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onArchive: (id: string) => void;
}

function isToday(deadline: string): boolean {
  const d = deadline.toLowerCase();
  return d.includes("today") || d.includes("eod");
}

function filterGroupCards(groupId: string, cards: Card[]): Card[] {
  if (groupId === "overdue") {
    return cards.filter((c) => c.col === "overdue");
  }
  if (groupId === "today") {
    return cards.filter(
      (c) => c.col === "action" && c.deadline !== null && isToday(c.deadline)
    );
  }
  return cards.filter(
    (c) =>
      c.col === "action" && (c.deadline === null || !isToday(c.deadline))
  );
}

export function ActionDetailView({
  cards,
  colConfig,
  onDragStart,
  onDragEnd,
  onArchive,
}: ActionDetailViewProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {actionGroupHeaders.map((group) => {
        const groupCards = filterGroupCards(group.id, cards);
        return (
          <div key={group.id} className="flex flex-col">
            <ColumnHeader
              label={group.label}
              count={groupCards.length}
              dotClass={group.dot}
              pillBg={group.pillBg}
              pillText={group.pillText}
              pillBorder={group.pillBorder}
            />
            <div className="min-h-44">
              {groupCards.map((card) => (
                <EmailCard
                  key={card.id}
                  card={card}
                  colConfig={colConfig}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onArchive={onArchive}
                />
              ))}
              {groupCards.length === 0 && <EmptyState>None</EmptyState>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
