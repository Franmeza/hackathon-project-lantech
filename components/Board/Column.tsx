"use client";

import type { Card, ColId, ColConfigMap } from "@/types";
import { EmailCard } from "@/components/Card/EmailCard";
import { ColumnHeader } from "@/components/ui/ColumnHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { dropZoneActiveByCol } from "@/lib/ui-tokens";

interface ColumnProps {
  colId: ColId;
  cards: Card[];
  config: ColConfigMap;
  dragOver: ColId | null;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDragOver: (colId: ColId) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, colId: ColId) => void;
  onArchive: (id: string) => void;
}

export function Column({
  colId,
  cards,
  config,
  dragOver,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onArchive,
}: ColumnProps) {
  const cfg = config[colId];
  const isOver = dragOver === colId;

  const dropZoneBase = "min-h-44 rounded-xl p-0.5 border-2 transition-all";
  const dropZoneClass = isOver
    ? dropZoneBase + " border-dashed " + dropZoneActiveByCol[colId]
    : dropZoneBase + " border-transparent";

  return (
    <div className="flex flex-col">
      <ColumnHeader
        label={cfg.label}
        count={cards.length}
        showDot={false}
        pillBg={cfg.pillBg}
        pillText={cfg.pillText}
        pillBorder={cfg.pillBorder}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver(colId);
        }}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, colId)}
        className={dropZoneClass}
      >
        {cards.map((card) => (
          <EmailCard
            key={card.id}
            card={card}
            colConfig={config}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onArchive={onArchive}
          />
        ))}
        {cards.length === 0 && <EmptyState>Drop cards here</EmptyState>}
      </div>
    </div>
  );
}
