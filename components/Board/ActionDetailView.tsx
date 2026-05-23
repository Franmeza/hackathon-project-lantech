"use client";

import type { Card, ColConfigMap } from "@/types";
import { EmailCard } from "@/components/Card/EmailCard";

interface ActionGroup {
  label: string;
  dot: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  cards: Card[];
}

interface ActionDetailViewProps {
  cards: Card[];
  colConfig: ColConfigMap;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onArchive: (id: string) => void;
}

function isToday(deadline: string): boolean {
  const d = deadline.toLowerCase();
  return d.includes("today") || d.includes("eod");
}

export function ActionDetailView({
  cards,
  colConfig,
  onDragStart,
  onDragEnd,
  onArchive,
}: ActionDetailViewProps) {
  const groups: ActionGroup[] = [
    {
      label: "Overdue",
      dot: "bg-red-500",
      pillBg: "bg-red-50",
      pillText: "text-red-800",
      pillBorder: "border-red-200",
      cards: cards.filter((c) => c.col === "overdue"),
    },
    {
      label: "Today",
      dot: "bg-orange-400",
      pillBg: "bg-orange-50",
      pillText: "text-orange-800",
      pillBorder: "border-orange-200",
      cards: cards.filter(
        (c) => c.col === "action" && c.deadline !== null && isToday(c.deadline)
      ),
    },
    {
      label: "Upcoming",
      dot: "bg-gray-400",
      pillBg: "bg-gray-100",
      pillText: "text-gray-700",
      pillBorder: "border-gray-200",
      cards: cards.filter(
        (c) =>
          c.col === "action" &&
          (c.deadline === null || !isToday(c.deadline))
      ),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col">
          {/* Column header */}
          <div className="flex items-center gap-2 mb-2.5 pb-2.5 border-b border-gray-100">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${group.dot}`} />
            <span className="text-[13px] font-semibold text-gray-700">
              {group.label}
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${group.pillBg} ${group.pillText} ${group.pillBorder}`}
            >
              {group.cards.length}
            </span>
          </div>

          {/* Cards */}
          <div className="min-h-44">
            {group.cards.map((card) => (
              <EmailCard
                key={card.id}
                card={card}
                colConfig={colConfig}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onArchive={onArchive}
              />
            ))}
            {group.cards.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-300 border border-dashed border-gray-200 rounded-xl">
                None
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
