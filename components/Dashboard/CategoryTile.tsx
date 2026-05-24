"use client";

import type { Card, TileDefinition } from "@/types";
import { COL_CONFIG } from "@/lib/col-config";
import { DotIndicator } from "@/components/ui/DotIndicator";
import { TileIcon, type TileIconId } from "@/components/ui/Icon";
import {
  dashboardTileLayout,
  surfaces,
  tileIdentity,
} from "@/lib/ui-tokens";

interface CategoryTileProps {
  tile: TileDefinition;
  cards: Card[];
  onClick: (tileId: string) => void;
}

const PREVIEW_LIMIT = 3;

export function CategoryTile({ tile, cards, onClick }: CategoryTileProps) {
  const primaryCol = tile.cols[0];
  const colConfig = COL_CONFIG[primaryCol];
  const identity = tileIdentity[tile.id as keyof typeof tileIdentity];
  const previews = cards.slice(0, PREVIEW_LIMIT);

  return (
    <button
      type="button"
      onClick={() => onClick(tile.id)}
      className={
        dashboardTileLayout.categoryCard +
        " " +
        surfaces.cardBorder +
        " " +
        identity.hoverBorder
      }
    >
      <div className="flex items-start justify-between gap-4 mb-3.5">
        <div className="flex items-center gap-3.5 min-w-0">
          <span
            className={`${dashboardTileLayout.categoryIcon} ${identity.iconBg} shrink-0`}
          >
            <TileIcon
              tileId={tile.id as TileIconId}
              size="sm"
              className={identity.iconColor}
            />
          </span>
          <div className="flex flex-col min-w-0">
            <span className={dashboardTileLayout.categoryTitle}>{tile.label}</span>
            <p className="text-[12px] text-gray-400 mt-1 leading-snug">{tile.subtitle}</p>
          </div>
        </div>
        <div
          className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 shrink-0 ${identity.iconBg}`}
        >
          <span className={`text-2xl font-bold leading-none tabular-nums ${identity.counterColor}`}>
            {cards.length}
          </span>
        </div>
      </div>

      {previews.length > 0 ? (
        <div className={dashboardTileLayout.categoryPreviewList}>
          {previews.map((card) => (
            <div key={card.id} className={dashboardTileLayout.categoryPreviewRow}>
              <DotIndicator
                colorClass={colConfig.dot}
                className={dashboardTileLayout.categoryPreviewDot}
              />
              <div className="min-w-0 flex-1">
                <p className={dashboardTileLayout.categoryPreviewSender}>
                  {card.sender}
                </p>
                <p className={dashboardTileLayout.categoryPreviewTask}>
                  {card.task}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1">
          <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 px-3 py-4 text-[11px] text-gray-300">
            None
          </div>
        </div>
      )}

      <div className={dashboardTileLayout.categoryFooter}>
        <span
          className={
            dashboardTileLayout.categoryLink + " " + identity.link
          }
        >
          View all {cards.length} →
        </span>
      </div>
    </button>
  );
}
