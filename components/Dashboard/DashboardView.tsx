"use client";

import type { Card } from "@/types";
import { TILE_DEFINITIONS } from "@/lib/col-config";
import { SummaryTile } from "@/components/Dashboard/SummaryTile";

interface DashboardViewProps {
  activeCards: Card[];
  onTileClick: (tileId: string) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardView({ activeCards, onTileClick }: DashboardViewProps) {
  const totalEmails = activeCards.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header — same style as the existing board header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
            Inbox actions
          </h1>
          {totalEmails > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-800">
              {totalEmails} emails
            </span>
          )}
        </div>
        <span className="text-[11px] text-gray-400">
          {getGreeting().toLowerCase().replace("good ", "")} · updated just now
        </span>
      </div>

      {/* 2×2 tile grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {TILE_DEFINITIONS.map((tile) => {
          const tileCards = activeCards.filter((c) =>
            tile.cols.includes(c.col)
          );
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
