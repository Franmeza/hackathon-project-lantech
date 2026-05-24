"use client";

import { LogOutButton } from "@/components/Auth/LogOutButton";

export type ViewId = "inbox" | "archive";

interface SidebarProps {
  view: ViewId;
  onNavigate: (view: ViewId) => void;
  archiveCount: number;
  userEmail?: string;
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

function truncateEmail(email: string, max = 14): string {
  if (email.length <= max) return email;
  const at = email.indexOf("@");
  if (at <= 0) return `${email.slice(0, max - 1)}…`;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const shortLocal =
    local.length > 6 ? `${local.slice(0, 5)}…` : local;
  return `${shortLocal}@${domain.split(".")[0]}…`;
}

export function Sidebar({
  view,
  onNavigate,
  archiveCount,
  userEmail,
}: SidebarProps) {
  return (
    <aside className="w-14 flex-shrink-0 flex flex-col items-center pt-2 gap-1 border-r border-gray-100 min-h-screen">
      <div className="flex flex-col items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              className={`relative w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? "bg-gray-100"
                  : "bg-transparent hover:bg-gray-50"
              }`}
            >
              {item.id === "inbox" ? (
                <InboxIcon active={isActive} />
              ) : (
                <ArchiveIcon active={isActive} />
              )}
              <span
                className={`text-[9px] font-medium leading-none ${
                  isActive ? "text-gray-900 font-semibold" : "text-gray-400"
                }`}
              >
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
      </div>

      <div className="mt-auto mb-3 flex flex-col items-center gap-2 px-1">
        {userEmail && (
          <span
            className="text-[8px] text-gray-400 text-center leading-tight max-w-full truncate"
            title={userEmail}
          >
            {truncateEmail(userEmail)}
          </span>
        )}
        <LogOutButton variant="icon" />
      </div>
    </aside>
  );
}
