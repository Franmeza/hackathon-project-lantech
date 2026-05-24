"use client";

import type { Card } from "@/types";
import { TILE_DEFINITIONS } from "@/lib/col-config";
import { SummaryTile } from "@/components/Dashboard/SummaryTile";
import { PasteMessage } from "@/components/PasteMessage/PasteMessage";
import { LogOutButton } from "@/components/Auth/LogOutButton";

interface DashboardViewProps {
  activeCards: Card[];
  onTileClick: (tileId: string) => void;
  onExtracted: () => void;
  userEmail?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardView({ activeCards, onTileClick, onExtracted, userEmail }: DashboardViewProps) {
  const totalEmails = activeCards.length;

  return (
    <div className="flex flex-col gap-3">
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
        <div className="flex items-center gap-3">
          {userEmail && (
            <span
              className="text-[11px] text-gray-400 hidden sm:inline"
              title={userEmail}
            >
              {userEmail}
            </span>
          )}
          <span className="text-[11px] text-gray-400">
            {getGreeting().toLowerCase().replace("good ", "")} · updated just now
          </span>
          <LogOutButton />
        </div>
      </div>

      <PasteMessage onExtracted={onExtracted} fullWidth />

      {/* 2×2 tile grid */}
      <div className="grid grid-cols-2 gap-3.5 mt-2">
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

      {totalEmails === 0 && (
        <div className="text-center py-10 px-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <p className="text-sm font-medium text-gray-600">No emails yet</p>
          <p className="text-xs text-gray-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            New Gmail messages will appear here after they arrive. You can also
            paste a message above to classify it manually.
          </p>
        </div>
      )}
    </div>
  );
}
