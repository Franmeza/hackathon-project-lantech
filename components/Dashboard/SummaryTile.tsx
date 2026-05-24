"use client";

import type { Card, TileDefinition } from "@/types";
import { COL_CONFIG } from "@/lib/col-config";

interface SummaryTileProps {
  tile: TileDefinition;
  cards: Card[];
  onClick: (tileId: string) => void;
}

function buildAiSummary(cards: Card[]): string {
  if (cards.length === 0) return "No new emails in this category.";
  const tasks = cards
    .slice(0, 3)
    .map((c) => c.task)
    .join(" · ");
  return tasks.length > 140 ? tasks.slice(0, 140) + "…" : tasks;
}

function isToday(deadline: string): boolean {
  const d = deadline.toLowerCase();
  return d.includes("today") || d.includes("eod");
}

function ActionSubPills({ cards }: { cards: Card[] }) {
  const overdue = cards.filter((c) => c.col === "overdue").length;
  const today = cards.filter(
    (c) => c.col === "action" && c.deadline !== null && isToday(c.deadline)
  ).length;
  const upcoming = cards.filter(
    (c) => c.col === "action" && c.deadline !== null && !isToday(c.deadline)
  ).length;

  return (
    <div className="flex gap-1.5 flex-wrap mt-3">
      {overdue > 0 && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 font-semibold">
          {overdue} overdue
        </span>
      )}
      {today > 0 && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
          {today} due today
        </span>
      )}
      {upcoming > 0 && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-600 font-semibold">
          {upcoming} upcoming
        </span>
      )}
    </div>
  );
}

// Maps tile id to a left-border accent color class
const ACCENT_BORDER: Record<string, string> = {
  action: "border-l-red-500",
  sub:    "border-l-blue-400",
  invoice:"border-l-amber-400",
  other:  "border-l-violet-400",
};

// Maps tile id to the count number text color
const COUNT_COLOR: Record<string, string> = {
  action:  "text-red-500",
  sub:     "text-blue-500",
  invoice: "text-amber-500",
  other:   "text-violet-500",
};

export function SummaryTile({ tile, cards, onClick }: SummaryTileProps) {
  const summary = buildAiSummary(cards);
  const isAction = tile.id === "action";
  const primaryColConfig = COL_CONFIG[tile.cols[0]];
  const accentBorder = ACCENT_BORDER[tile.id] ?? "border-l-gray-300";
  const countColor   = COUNT_COLOR[tile.id]   ?? "text-gray-500";

  return (
    <button
      onClick={() => onClick(tile.id)}
      className={`group text-left w-full bg-white rounded-xl border border-gray-200 border-l-4 ${accentBorder} shadow-sm hover:shadow-md hover:border-gray-300 hover:border-l-4 transition-all duration-150 p-5 relative overflow-hidden`}
    >
      {/* Subtle hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-transparent to-gray-50/60 pointer-events-none" />

      {/* Header: icon + label */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-[16px] ${primaryColConfig.bg}`}
          >
            {tile.icon}
          </span>
          <div>
            <p className="text-[13px] font-semibold text-gray-900 leading-tight">
              {tile.label}
            </p>
            <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
              {tile.subtitle}
            </p>
          </div>
        </div>

        {/* Big count */}
        <span className={`text-3xl font-bold tabular-nums leading-none ${countColor}`}>
          {cards.length}
        </span>
      </div>

      {/* Action sub-pills */}
      {isAction && <ActionSubPills cards={cards} />}

      {/* AI summary */}
      <div className="flex gap-1.5 items-start mt-4 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
        <span className="text-gray-300 flex-shrink-0 text-[12px] mt-0.5">✦</span>
        <span className="text-[11px] text-gray-500 leading-snug line-clamp-2">
          {summary}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end mt-3">
        <span
          className={`text-[11px] font-semibold ${countColor} opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-1`}
        >
          View all
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
    </button>
  );
}
