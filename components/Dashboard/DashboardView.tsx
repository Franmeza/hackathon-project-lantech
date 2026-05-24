"use client";

import type { Card } from "@/types";
import { TILE_DEFINITIONS } from "@/lib/col-config";
import { ActionHeroTile } from "@/components/Dashboard/ActionHeroTile";
import { CategoryTile } from "@/components/Dashboard/CategoryTile";
import { PasteMessage } from "@/components/PasteMessage/PasteMessage";
import { functionalColors, layout, surfaces, typography } from "@/lib/ui-tokens";

interface DashboardViewProps {
  activeCards: Card[];
  onTileClick: (tileId: string) => void;
  onExtracted: () => void;
}

const SECONDARY_TILE_IDS = ["invoice", "other", "sub"] as const;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardView({ activeCards, onTileClick, onExtracted }: DashboardViewProps) {
  const totalEmails = activeCards.length;

  const actionTile = TILE_DEFINITIONS.find((t) => t.id === "action");
  const actionCards = actionTile
    ? activeCards.filter((c) => actionTile.cols.includes(c.col))
    : [];

  const secondaryTiles = SECONDARY_TILE_IDS.map((id) =>
    TILE_DEFINITIONS.find((t) => t.id === id)
  ).filter((t): t is NonNullable<typeof t> => t !== undefined);

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

      {actionTile && (
        <ActionHeroTile
          cards={actionCards}
          onClick={() => onTileClick("action")}
        />
      )}

      <div className={layout.dashboardSecondaryGrid}>
        {secondaryTiles.map((tile) => {
          const tileCards = activeCards.filter((c) => tile.cols.includes(c.col));
          return (
            <CategoryTile
              key={tile.id}
              tile={tile}
              cards={tileCards}
              onClick={onTileClick}
            />
          );
        })}
      </div>

      {totalEmails === 0 && (
        <div className={"text-center py-10 px-6 border border-dashed rounded-xl " + surfaces.inset}>
          <p className="text-sm font-medium text-gray-600">No emails yet</p>
          <p className={typography.meta + " mt-1.5 max-w-sm mx-auto leading-relaxed"}>
            New Gmail messages will appear here after they arrive. You can also
            paste a message above to classify it manually.
          </p>
        </div>
      )}
    </div>
  );
}
