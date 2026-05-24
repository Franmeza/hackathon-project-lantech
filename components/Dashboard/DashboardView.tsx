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
  userEmail?: string;
}

const SECONDARY_TILE_IDS = ["invoice", "other", "sub"] as const;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getFirstName(email: string): string {
  const local = email.split("@")[0] ?? "";
  const name = local.split(/[._-]/)[0] ?? local;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function getAvatarBg(email: string): string {
  const palette = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

export function DashboardView({
  activeCards,
  onTileClick,
  onExtracted,
  userEmail,
}: DashboardViewProps) {
  const totalEmails = activeCards.length;
  const greeting = getGreeting();
  const firstName = userEmail ? getFirstName(userEmail) : null;
  const avatarBg = userEmail ? getAvatarBg(userEmail) : "bg-gray-400";
  const avatarLetter = userEmail ? userEmail[0].toUpperCase() : "?";
  const urgentCount = activeCards.filter((c) => c.col === "overdue").length;

  const actionTile = TILE_DEFINITIONS.find((t) => t.id === "action");
  const actionCards = actionTile
    ? activeCards.filter((c) => actionTile.cols.includes(c.col))
    : [];

  const secondaryTiles = SECONDARY_TILE_IDS.map((id) =>
    TILE_DEFINITIONS.find((t) => t.id === id)
  ).filter((t): t is NonNullable<typeof t> => t !== undefined);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          {userEmail && (
            <div
              className={`w-7 h-7 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-white text-[11px] font-bold">{avatarLetter}</span>
            </div>
          )}
          <h1 className={typography.pageTitle}>
            {greeting}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          {totalEmails > 0 && (
            <span className={functionalColors.emailCount}>{totalEmails} emails</span>
          )}
        </div>
        <p className={typography.meta + (userEmail ? " ml-9" : "")}>
          {totalEmails === 0
            ? "Your inbox is clear — nice work."
            : urgentCount > 0
              ? `${urgentCount} overdue item${urgentCount === 1 ? "" : "s"} need${urgentCount === 1 ? "s" : ""} your attention.`
              : `${totalEmails} email${totalEmails === 1 ? "" : "s"} to review.`}
        </p>
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
