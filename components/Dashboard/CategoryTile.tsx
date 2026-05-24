"use client";

import type { Card, TileDefinition } from "@/types";
import { COL_CONFIG } from "@/lib/col-config";
import { DotIndicator } from "@/components/ui/DotIndicator";
import { TileIcon, type TileIconId } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
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
    <div
      className={
        dashboardTileLayout.categoryCard +
        " " +
        surfaces.cardBorder +
        " " +
        identity.hoverBorder
      }
    >
      <button
        type="button"
        onClick={() => onClick(tile.id)}
        className="w-full text-left flex flex-col flex-1"
      >
        <div className={dashboardTileLayout.categoryHeader}>
        <div className={dashboardTileLayout.categoryTitleRow}>
          <div className={dashboardTileLayout.categoryTitleBlock}>
            <span
              className={
                dashboardTileLayout.categoryIcon + " " + identity.iconBg
              }
            >
              <TileIcon
                tileId={tile.id as TileIconId}
                size="sm"
                className={identity.iconColor}
              />
            </span>
            <span className={dashboardTileLayout.categoryTitle}>{tile.label}</span>
          </div>
          <Pill
            bg={colConfig.pillBg}
            text={colConfig.pillText}
            border={colConfig.pillBorder}
            className="shrink-0"
          >
            {cards.length}
          </Pill>
        </div>
        <p className={dashboardTileLayout.categorySubtitle}>{tile.subtitle}</p>
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
        <p className="text-[11px] text-gray-400 flex-1">No items yet</p>
      )}
      </button>

      <div className={dashboardTileLayout.categoryFooter}>
        <span
          className={
            dashboardTileLayout.categoryLink + " " + identity.link
          }
        >
          View all {cards.length} →
        </span>
      </div>
    </div>
  );
}
