"use client";

import type { Card, ColId, ColConfigMap } from "@/types";
import { ArchiveCard } from "@/components/Card/ArchiveCard";

const COL_ORDER: ColId[] = ["action", "overdue", "invoice", "sub", "other"];

interface ArchiveViewProps {
  archived: Card[];
  colConfig: ColConfigMap;
  onRestore: (id: string) => void;
}

export function ArchiveView({ archived, colConfig, onRestore }: ArchiveViewProps) {
  const grouped = COL_ORDER.reduce<Record<ColId, Card[]>>(
    (acc, col) => {
      acc[col] = archived.filter((c) => c.col === col);
      return acc;
    },
    { action: [], overdue: [], invoice: [], sub: [], other: [] }
  );

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-5">
        <span className="text-lg font-semibold text-gray-900 tracking-tight">
          Archive
        </span>
        <span className="text-sm text-gray-400 ml-2.5">
          {archived.length} {archived.length === 1 ? "card" : "cards"}
        </span>
      </div>

      {archived.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-300 border border-dashed border-gray-200 rounded-2xl">
          Nothing archived yet — hover a card and click Archive to move it here.
        </div>
      ) : (
        COL_ORDER.map((col) => {
          const items = grouped[col];
          if (!items.length) return null;
          const cfg = colConfig[col];
          return (
            <div key={col} className="mb-6">
              <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-gray-100">
                <span className={`w-2 h-2 rounded-full inline-block ${cfg.dot}`} />
                <span className="text-[13px] font-semibold text-gray-700">
                  {cfg.label}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.pillBg} ${cfg.pillText} ${cfg.pillBorder}`}
                >
                  {items.length}
                </span>
              </div>
              {items.map((card) => (
                <ArchiveCard
                  key={card.id}
                  card={card}
                  colConfig={colConfig}
                  onRestore={onRestore}
                />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
