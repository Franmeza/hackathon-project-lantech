"use client";

import { layout, sidebarNavButton, sidebarNavLabel } from "@/lib/ui-tokens";

type ViewId = "inbox" | "archive";

interface SidebarProps {
  view: ViewId;
  onNavigate: (view: ViewId) => void;
  archiveCount: number;
}

const InboxIcon = ({ active }: { active: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "#111827" : "#9CA3AF"}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
  </svg>
);

const ArchiveIcon = ({ active }: { active: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "#111827" : "#9CA3AF"}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const NAV_ITEMS: { id: ViewId; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "archive", label: "Archive" },
];

export function Sidebar({ view, onNavigate, archiveCount }: SidebarProps) {
  return (
    <aside className={layout.sidebar}>
      {NAV_ITEMS.map((item) => {
        const isActive = view === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            title={item.label}
            className={isActive ? sidebarNavButton.active : sidebarNavButton.inactive}
          >
            {item.id === "inbox" ? (
              <InboxIcon active={isActive} />
            ) : (
              <ArchiveIcon active={isActive} />
            )}
            <span className={isActive ? sidebarNavLabel.active : sidebarNavLabel.inactive}>
              {item.label}
            </span>
            {item.id === "archive" && archiveCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-gray-500 text-white text-[8px] font-bold flex items-center justify-center">
                {archiveCount > 9 ? "9+" : archiveCount}
              </span>
            )}
          </button>
        );
      })}
    </aside>
  );
}
