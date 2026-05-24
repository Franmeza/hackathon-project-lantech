"use client";

import type { Card, ColConfigMap } from "@/types";
import { EmailCard } from "@/components/Card/EmailCard";
import { ColumnHeader } from "@/components/ui/ColumnHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { isTodayDeadline } from "@/lib/dashboard-utils";
import { actionGroupHeaders } from "@/lib/ui-tokens";

interface ActionDetailViewProps {
  cards: Card[];
  colConfig: ColConfigMap;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onArchive: (id: string) => void;
  selectionMode?: boolean;
  isSelected?: (id: string) => boolean;
  onToggleSelect?: (id: string) => void;
  onArchiveGroup?: (ids: string[]) => void;
}

function filterGroupCards(groupId: string, cards: Card[]): Card[] {
  if (groupId === "overdue") {
    return cards.filter((c) => c.col === "overdue");
  }
  if (groupId === "today") {
    return cards.filter(
      (c) =>
        c.col === "action" && c.deadline !== null && isTodayDeadline(c.deadline)
    );
  }
  return cards.filter(
    (c) =>
      c.col === "action" &&
      (c.deadline === null || !isTodayDeadline(c.deadline))
  );
}

export function ActionDetailView({
  cards,
  colConfig,
  onDragStart,
  onDragEnd,
  onArchive,
  selectionMode = false,
  isSelected,
  onToggleSelect,
  onArchiveGroup,
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
              right={
                groupCards.length > 0 && onArchiveGroup && !selectionMode ? (
                  <Button
                    variant="toolbar"
                    onClick={() => onArchiveGroup(groupCards.map((c) => c.id))}
                  >
                    Archive all
                  </Button>
                ) : null
              }
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
                  selectionMode={selectionMode}
                  selected={isSelected ? isSelected(card.id) : false}
                  onToggleSelect={onToggleSelect}
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
