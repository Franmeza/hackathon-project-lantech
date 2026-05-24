"use client";

import type { Card, TileDefinition, ColId } from "@/types";
import { COL_CONFIG } from "@/lib/col-config";
import { AiChip } from "@/components/ui/AiChip";
import { Card as UiCard } from "@/components/ui/Card";
import { DotIndicator } from "@/components/ui/DotIndicator";
import { Pill } from "@/components/ui/Pill";
import {
  functionalColors,
  groupHoverPillTextByCol,
  hoverBorderByCol,
  summaryTileLayout,
  surfaces,
} from "@/lib/ui-tokens";

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
  const overdue = cards.filter((c) => c.col === "overdue").length;
  const today = cards.filter(
    (c) => c.col === "action" && c.deadline !== null && isToday(c.deadline)
  ).length;
  const upcoming = cards.filter(
    (c) => c.col === "action" && c.deadline !== null && !isToday(c.deadline)
  ).length;

  return (
    <div className="flex gap-1.5 flex-wrap mt-2 mb-3">
      <span className={functionalColors.overdueSubPill}>{overdue} overdue</span>
      <span className={functionalColors.todaySubPill}>{today} today</span>
      <span className={functionalColors.upcomingSubPill}>{upcoming} upcoming</span>
    </div>
  );
}

export function SummaryTile({ tile, cards, onClick }: SummaryTileProps) {
  const summary = buildAiSummary(cards);
  const isAction = tile.id === "action";
  const primaryColId = tile.cols[0] as ColId;
  const primaryColConfig = COL_CONFIG[primaryColId];
  const hoverBorder = hoverBorderByCol[primaryColId];
  const groupHoverText = groupHoverPillTextByCol[primaryColId];

  const tileBorderClass = isAction ? surfaces.actionTileBorder : surfaces.cardBorder;
  const tileSurface = isAction ? "action" : "default";

  return (
    <UiCard
      as="button"
      variant="tile"
      surface={tileSurface}
      onClick={() => onClick(tile.id)}
      borderClass={tileBorderClass}
      className={summaryTileLayout.card + " " + hoverBorder}
    >
      <div className={summaryTileLayout.header}>
        <div className={summaryTileLayout.titleRow}>
          <span className={summaryTileLayout.titleLabel}>
            <DotIndicator
              colorClass={primaryColConfig.dot}
              className={summaryTileLayout.titleDot}
            />
            <span className={summaryTileLayout.titleText}>{tile.label}</span>
          </span>
          <Pill
            bg={primaryColConfig.pillBg}
            text={primaryColConfig.pillText}
            border={primaryColConfig.pillBorder}
            className="shrink-0"
          >
            {cards.length}
          </Pill>
        </div>
        <p className={summaryTileLayout.subtitle}>{tile.subtitle}</p>
      </div>

      <AiChip padding="relaxed" className="mb-0">
        {summary}
      </AiChip>

      {isAction && <ActionSubPills cards={cards} />}

      <div className={summaryTileLayout.footer}>
        <span
          className={
            "text-[11px] font-medium text-gray-400 " + groupHoverText + " transition-colors"
          }
        >
          Open →
        </span>
      </div>
    </UiCard>
  );
}
