"use client";

import type { Card } from "@/types";
import { TILE_DEFINITIONS } from "@/lib/col-config";
import { SummaryTile } from "@/components/Dashboard/SummaryTile";
import { PasteMessage } from "@/components/PasteMessage/PasteMessage";
import { functionalColors, layout, typography } from "@/lib/ui-tokens";

interface DashboardViewProps {
  activeCards: Card[];
  onTileClick: (tileId: string) => void;
  onExtracted: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardView({ activeCards, onTileClick, onExtracted }: DashboardViewProps) {
  const totalEmails = activeCards.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className={typography.pageTitle}>Inbox actions</h1>
          {totalEmails > 0 && (
            <span className={functionalColors.emailCount}>{totalEmails} emails</span>
          )}
        </div>
        <span className={typography.meta}>
          {getGreeting().toLowerCase().replace("good ", "")} · updated just now
        </span>
      </div>

      <PasteMessage onExtracted={onExtracted} fullWidth />

      <div className={layout.dashboardGrid}>
        {TILE_DEFINITIONS.map((tile) => {
          const tileCards = activeCards.filter((c) => tile.cols.includes(c.col));
          return (
            <SummaryTile
              key={tile.id}
              tile={tile}
              cards={tileCards}
              onClick={onTileClick}
            />
          );
        })}
      </div>
    </div>
  );
}
