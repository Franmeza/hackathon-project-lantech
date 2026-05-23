"use client";

import type { Card, ColId, ColConfigMap } from "@/types";
import { EmailCard } from "@/components/Card/EmailCard";

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

  return (
    <div className="flex flex-col">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-2.5 pb-2.5 border-b border-gray-100">
        <span className="text-[13px] font-semibold text-gray-700">
          {cfg.label}
        </span>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.pillBg} ${cfg.pillText} ${cfg.pillBorder}`}
        >
          {cards.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver(colId);
        }}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, colId)}
        className={`min-h-44 rounded-xl p-0.5 border-2 transition-all ${
          isOver
            ? `border-dashed ${cfg.accent} ${cfg.bg}`
            : "border-transparent"
        }`}
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
        {cards.length === 0 && (
          <div className="text-center py-8 text-xs text-gray-300 border border-dashed border-gray-200 rounded-xl">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
}
