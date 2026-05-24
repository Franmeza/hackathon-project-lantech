"use client";

import type { Card } from "@/types";
import { TILE_DEFINITIONS } from "@/lib/col-config";
import { SummaryTile } from "@/components/Dashboard/SummaryTile";
import { PasteMessage } from "@/components/PasteMessage/PasteMessage";
import { LogOutButton } from "@/components/Auth/LogOutButton";

interface DashboardViewProps {
  activeCards: Card[];
  onTileClick: (tileId: string) => void;
  onExtracted: () => void;
  userEmail?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getFirstName(email: string): string {
  const local = email.split("@")[0] ?? "";
  const name = local.split(/[._-]/)[0] ?? local;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function getAvatarBg(email: string): string {
  const palette = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

export function DashboardView({
  activeCards,
  onTileClick,
  onExtracted,
  userEmail,
}: DashboardViewProps) {
  const totalEmails = activeCards.length;
  const greeting = getGreeting();
  const firstName = userEmail ? getFirstName(userEmail) : null;
  const avatarBg = userEmail ? getAvatarBg(userEmail) : "bg-gray-400";
  const avatarLetter = userEmail ? userEmail[0].toUpperCase() : "?";

  const actionCards = activeCards.filter((c) => ["action", "overdue"].includes(c.col));
  const urgentCount = actionCards.filter((c) => c.col === "overdue").length;

  return (
    <div className="flex flex-col gap-0">
      {/* ── Top header bar ── */}
      <div className="flex items-start justify-between pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-7 h-7 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-white text-[11px] font-bold">{avatarLetter}</span>
            </div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">
              {greeting}{firstName ? `, ${firstName}` : ""}.
            </h1>
          </div>
          <p className="text-[13px] text-gray-400 ml-9">
            {totalEmails === 0
              ? "Your inbox is clear — nice work."
              : urgentCount > 0
              ? `${urgentCount} overdue item${urgentCount === 1 ? "" : "s"} need${urgentCount === 1 ? "s" : ""} your attention.`
              : `${totalEmails} email${totalEmails === 1 ? "" : "s"} to review.`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {userEmail && (
            <span
              className="text-[11px] text-gray-400 hidden md:inline border border-gray-200 rounded-lg px-2.5 py-1 bg-white"
              title={userEmail}
            >
              {userEmail}
            </span>
          )}
          {/* Live sync indicator */}
          <span
            title="Syncing every 4 seconds"
            className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-400 border border-gray-200 rounded-lg px-2 py-1 bg-white select-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Live
          </span>
          <LogOutButton />
        </div>
      </div>

      {/* ── Stats strip ── */}
      {totalEmails > 0 && (
        <div className="flex gap-3 mb-5">
          {[
            {
              label: "Action required",
              count: activeCards.filter((c) => ["action", "overdue"].includes(c.col)).length,
              color: "text-red-600",
              bg: "bg-red-50 border-red-200",
            },
            {
              label: "Invoices",
              count: activeCards.filter((c) => c.col === "invoice").length,
              color: "text-amber-600",
              bg: "bg-amber-50 border-amber-200",
            },
            {
              label: "Subscriptions",
              count: activeCards.filter((c) => c.col === "sub").length,
              color: "text-blue-600",
              bg: "bg-blue-50 border-blue-200",
            },
            {
              label: "FYI",
              count: activeCards.filter((c) => c.col === "other").length,
              color: "text-violet-600",
              bg: "bg-violet-50 border-violet-200",
            },
          ]
            .filter((s) => s.count > 0)
            .map((stat) => (
              <div
                key={stat.label}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${stat.bg} ${stat.color}`}
              >
                <span className="font-bold tabular-nums">{stat.count}</span>
                <span className="font-medium opacity-70">{stat.label}</span>
              </div>
            ))}
        </div>
      )}

      {/* ── Paste message ── */}
      <div className="mb-5">
        <PasteMessage onExtracted={onExtracted} fullWidth />
      </div>

      {/* ── 2×2 tile grid ── */}
      <div className="grid grid-cols-2 gap-3.5">
        {TILE_DEFINITIONS.map((tile) => {
          const tileCards = activeCards.filter((c) =>
            tile.cols.includes(c.col)
          );
          return (
            <SummaryTile
              key={tile.id}
              tile={tile}
              cards={tileCards}
              onClick={onTileClick}
            />
          );
        })}
      </div>

      {/* ── Empty state ── */}
      {totalEmails === 0 && (
        <div className="mt-3 text-center py-12 px-6 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700">No emails yet</p>
          <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            New Gmail messages will appear here automatically. You can also
            paste any message above to classify it manually.
          </p>
        </div>
      )}
    </div>
  );
}
