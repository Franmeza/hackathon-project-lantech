"use client";

import type { Card } from "@/types";
import { Pill } from "@/components/ui/Pill";
import { TileIcon } from "@/components/ui/Icon";
import { RelativeTime } from "@/components/ui/RelativeTime";
import {
  actionUrgencyStyle,
  dashboardTileLayout,
} from "@/lib/ui-tokens";
import {
  countActionGroups,
  DASHBOARD_TILE_PREVIEW_LIMIT,
  getActionUrgency,
  getInitials,
  sortByUrgency,
  urgencyLabel,
  type ActionUrgency,
} from "@/lib/dashboard-utils";

interface ActionHeroTileProps {
  cards: Card[];
  onClick: () => void;
}

const PREVIEW_LIMIT = DASHBOARD_TILE_PREVIEW_LIMIT;

function StatCounter({
  count,
  label,
  urgency,
}: {
  count: number;
  label: string;
  urgency: ActionUrgency;
}) {
  const style = actionUrgencyStyle[urgency];
  return (
    <div className={dashboardTileLayout.statBox + " " + style.statBox}>
      <span className={dashboardTileLayout.statNumber + " " + style.statNumber}>
        {count}
      </span>
      <span className={dashboardTileLayout.statLabel}>{label}</span>
    </div>
  );
}

function PreviewRow({ card }: { card: Card }) {
  const urgency = getActionUrgency(card);
  const style = actionUrgencyStyle[urgency];

  return (
    <div className={dashboardTileLayout.previewRow}>
      <span
        className={
          dashboardTileLayout.previewAvatar + " " + style.avatar
        }
      >
        {getInitials(card.sender)}
      </span>
      <div className={dashboardTileLayout.previewContent}>
        <p className={dashboardTileLayout.previewSender}>{card.sender}</p>
        <p className={dashboardTileLayout.previewTask}>{card.task}</p>
      </div>
      <div className={dashboardTileLayout.previewMeta}>
        <Pill
          bg={style.badgeBg}
          text={style.badgeText}
          border={style.badgeBorder}
          small
        >
          {urgencyLabel(urgency)}
        </Pill>
        <RelativeTime
          date={card.createdAt}
          className={dashboardTileLayout.previewTime + " " + style.time}
        />
      </div>
    </div>
  );
}

export function ActionHeroTile({ cards, onClick }: ActionHeroTileProps) {
  const counts = countActionGroups(cards);
  const previews = sortByUrgency(cards).slice(0, PREVIEW_LIMIT);

  return (
    <button type="button" onClick={onClick} className={dashboardTileLayout.heroCard}>
      <div className={dashboardTileLayout.heroHeader}>
        <div className={dashboardTileLayout.heroTitleBlock}>
          <span className={dashboardTileLayout.heroIcon}>
            <TileIcon tileId="action" size="md" className="text-red-600" />
          </span>
          <div>
            <p className={dashboardTileLayout.heroTitle}>Action required</p>
            <p className={dashboardTileLayout.heroSubtitle}>
              Needs your reply or decision
            </p>
          </div>
        </div>
        <div className={dashboardTileLayout.statGrid}>
          <StatCounter count={counts.overdue} label="Overdue" urgency="overdue" />
          <StatCounter count={counts.today} label="Today" urgency="today" />
          <StatCounter
            count={counts.upcoming}
            label="Upcoming"
            urgency="upcoming"
          />
        </div>
      </div>

      {previews.length > 0 && (
        <div className={dashboardTileLayout.previewList}>
          {previews.map((card) => (
            <PreviewRow key={card.id} card={card} />
          ))}
        </div>
      )}

      <div className={dashboardTileLayout.heroFooter}>
        <span className={dashboardTileLayout.heroLink}>
          View all {cards.length} →
        </span>
      </div>
    </button>
  );
}
