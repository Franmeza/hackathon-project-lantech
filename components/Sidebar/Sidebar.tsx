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
    width="16"
    height="16"
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
    width="16"
    height="16"
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

function getInitials(email: string): string {
  const local = email.split("@")[0] ?? "?";
  return local.charAt(0).toUpperCase();
}

function getAvatarBg(email: string): string {
  const palette = [
    "#7C3AED", // violet
    "#2563EB", // blue
    "#059669", // emerald
    "#D97706", // amber
    "#DC2626", // rose
    "#4F46E5", // indigo
    "#0D9488", // teal
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

export function Sidebar({
  view,
  onNavigate,
  archiveCount,
  userEmail,
}: SidebarProps) {
  const avatarBg = userEmail ? getAvatarBg(userEmail) : "#6B7280";
  const initials = userEmail ? getInitials(userEmail) : "?";

  return (
    <aside className="w-[60px] flex-shrink-0 flex flex-col items-center py-3 gap-0 border-r border-gray-100 sticky top-0 h-screen bg-white">
      {/* Logo mark */}
      <div className="mb-4 mt-1">
        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
          </svg>
        </div>
      </div>

      {/* Divider */}
      <div className="w-6 h-px bg-gray-100 mb-3" />

      {/* Nav items */}
      <div className="flex flex-col items-center gap-1 w-full px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              className={`relative w-full h-9 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                isActive
                  ? "bg-gray-100 shadow-inner"
                  : "bg-transparent hover:bg-gray-50"
              }`}
            >
              {item.id === "inbox" ? (
                <InboxIcon active={isActive} />
              ) : (
                <ArchiveIcon active={isActive} />
              )}
              <span
                className={`text-[8.5px] font-semibold leading-none ${
                  isActive ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
              {item.id === "archive" && archiveCount > 0 && (
                <span className="absolute top-1 right-1.5 min-w-[14px] h-3.5 rounded-full bg-gray-500 text-white text-[7px] font-bold flex items-center justify-center px-0.5">
                  {archiveCount > 9 ? "9+" : archiveCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User + logout */}
      <div className="flex flex-col items-center gap-2 px-2 mb-2 w-full">
        {/* User avatar */}
        {userEmail && (
          <div
            title={userEmail}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 cursor-default"
            style={{ backgroundColor: avatarBg }}
          >
            {initials}
          </div>
        )}
        <LogOutButton variant="icon" />
      </div>
    </aside>
  );
}
