"use client";

import type { Card, ColId, ColConfigMap } from "@/types";
import { ArchiveCard } from "@/components/Card/ArchiveCard";
import { ColumnHeader } from "@/components/ui/ColumnHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { typography } from "@/lib/ui-tokens";

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
        <span className={typography.pageTitle}>Archive</span>
        <span className="text-sm text-gray-400 ml-2.5">
          {archived.length} {archived.length === 1 ? "card" : "cards"}
        </span>
      </div>

      {archived.length === 0 ? (
        <EmptyState size="large">
          Nothing archived yet — hover a card and click Archive to move it here.
        </EmptyState>
      ) : (
        COL_ORDER.map((col) => {
          const items = grouped[col];
          if (!items.length) return null;
          const cfg = colConfig[col];
          return (
            <div key={col} className="mb-6">
              <ColumnHeader
                label={cfg.label}
                count={items.length}
                dotClass={cfg.dot}
                pillBg={cfg.pillBg}
                pillText={cfg.pillText}
                pillBorder={cfg.pillBorder}
                className="pb-2"
              />
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
