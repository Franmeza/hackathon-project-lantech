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
  return tasks.length > 120 ? tasks.slice(0, 120) + "…" : tasks;
}

function isToday(deadline: string): boolean {
  const d = deadline.toLowerCase();
  return d.includes("today") || d.includes("eod");
}

function ActionSubPills({ cards }: { cards: Card[] }) {
  // Mutually exclusive buckets:
  // overdue  → col === "overdue" (missed deadline, no reply)
  // today    → col === "action"  AND deadline is today/EOD
  // upcoming → col === "action"  AND deadline exists but not today
  const overdue = cards.filter((c) => c.col === "overdue").length;
  const today = cards.filter(
    (c) => c.col === "action" && c.deadline !== null && isToday(c.deadline)
  ).length;
  const upcoming = cards.filter(
    (c) => c.col === "action" && c.deadline !== null && !isToday(c.deadline)
  ).length;

  return (
    <div className="flex gap-1.5 flex-wrap mt-2">
      <span className="text-[11px] px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-700 font-medium">
        {overdue} overdue
      </span>
      <span className="text-[11px] px-2 py-0.5 rounded-full border border-yellow-200 bg-yellow-50 text-yellow-800 font-medium">
        {today} today
      </span>
      <span className="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-gray-100 text-gray-600 font-medium">
        {upcoming} upcoming
      </span>
    </div>
  );
}

export function SummaryTile({ tile, cards, onClick }: SummaryTileProps) {
  const summary = buildAiSummary(cards);
  const isAction = tile.id === "action";

  // Use the first col's config for the dot color and hover border
  const primaryColConfig = COL_CONFIG[tile.cols[0]];

  return (
    <button
      onClick={() => onClick(tile.id)}
      className={`group text-left w-full bg-white rounded-xl p-4 mb-0 cursor-pointer transition-colors border border-gray-200 hover:${primaryColConfig.border} relative`}
    >
      {/* Header row: label + dot + count */}
      <div className="flex justify-between items-start mb-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 inline-block ${primaryColConfig.dot}`}
          />
          {tile.label}
        </span>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${primaryColConfig.pillBg} ${primaryColConfig.pillText} ${primaryColConfig.pillBorder}`}
        >
          {cards.length}
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-[12px] text-gray-400 mb-2">{tile.subtitle}</p>

      {/* Sub-pills for Action Required */}
      {isAction && <ActionSubPills cards={cards} />}

      {/* AI summary chip — same style as the reason chip on EmailCard */}
      <div className="flex gap-1 items-start text-[11px] text-gray-500 bg-gray-50 border border-gray-100 rounded-md px-2 py-1.5 mt-3 mb-3">
        <span className="opacity-50 flex-shrink-0">✦</span>
        <span className="leading-snug">{summary}</span>
      </div>

      {/* Footer: open link */}
      <div className="flex justify-end">
        <span
          className={`text-[11px] font-medium text-gray-400 group-hover:${primaryColConfig.pillText} transition-colors`}
        >
          Open →
        </span>
      </div>
    </button>
  );
}
