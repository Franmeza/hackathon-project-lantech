"use client";

import type { Card, ColId, ColConfigMap } from "@/types";
import { EmailCard } from "@/components/Card/EmailCard";
import { ColumnHeader } from "@/components/ui/ColumnHeader";
import { Button } from "@/components/ui/Button";
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
  selectionMode?: boolean;
  isSelected?: (id: string) => boolean;
  onToggleSelect?: (id: string) => void;
  onArchiveAll?: (ids: string[]) => void;
  exitingIds?: Set<string>;
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
  selectionMode = false,
  isSelected,
  onToggleSelect,
  onArchiveAll,
  exitingIds,
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
        right={
          cards.length > 0 && onArchiveAll && !selectionMode ? (
            <Button
              variant="toolbar"
              onClick={() => onArchiveAll(cards.map((c) => c.id))}
            >
              <span className="hidden sm:inline">Archive all</span>
              <span className="sm:hidden">All</span>
            </Button>
          ) : null
        }
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!selectionMode) onDragOver(colId);
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
            selectionMode={selectionMode}
            selected={isSelected ? isSelected(card.id) : false}
            onToggleSelect={onToggleSelect}
            exitingIds={exitingIds}
          />
        ))}
        {cards.length === 0 && <EmptyState>Drop cards here</EmptyState>}
      </div>
    </div>
  );
}
