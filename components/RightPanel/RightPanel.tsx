"use client";

import type { Card } from "@/types";
import { SENDER_TYPE_BADGE, SENDER_TYPE_LABEL } from "@/lib/sender-config";
import { layout, rightPanel } from "@/lib/ui-tokens";

interface RightPanelProps {
  cards: Card[];
}

function buildInsightSummary(cards: Card[]): string {
  if (cards.length === 0) return "Your inbox is clear. No pending items.";

  const overdue   = cards.filter((c) => c.col === "overdue").length;
  const action    = cards.filter((c) => c.col === "action").length;
  const invoices  = cards.filter((c) => c.col === "invoice").length;
  const subs      = cards.filter((c) => c.col === "sub").length;
  const fyi       = cards.filter((c) => c.col === "other").length;

  const parts: string[] = [];
  if (overdue > 0)
    parts.push(`${overdue} overdue item${overdue === 1 ? "" : "s"} need${overdue === 1 ? "s" : ""} immediate attention`);
  if (action > 0)
    parts.push(`${action} action item${action === 1 ? "" : "s"} pending`);
  if (invoices > 0)
    parts.push(`${invoices} invoice${invoices === 1 ? "" : "s"} to review`);
  if (subs > 0)
    parts.push(`${subs} subscription${subs === 1 ? "" : "s"}`);
  if (fyi > 0)
    parts.push(`${fyi} FYI update${fyi === 1 ? "" : "s"}`);

  if (parts.length === 0) return "No urgent items right now.";
  if (parts.length === 1) return `${parts[0]}.`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}.`;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

export function RightPanel({ cards }: RightPanelProps) {
  const overdueCards = cards.filter((c) => c.col === "overdue");
  const upcomingCards = cards.filter(
    (c) => c.col === "action" && c.deadline !== null
  );
  const invoiceCards  = cards.filter((c) => c.col === "invoice");
  const recentCards   = [...cards]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const urgentCount = overdueCards.length + upcomingCards.filter((c) => {
    const d = (c.deadline ?? "").toLowerCase();
    return d.includes("today") || d.includes("eod");
  }).length;

  const insight = buildInsightSummary(cards);

  return (
    <aside className={layout.rightPanelShell + " flex flex-col"}>
      <div className="px-4 py-5 flex flex-col gap-5">

        {/* ── AI Overview ── */}
        <section>
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              AI Overview
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            {/* Score ring + urgency */}
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold
                ${urgentCount === 0 ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-200"
                  : urgentCount <= 2 ? "bg-amber-50 text-amber-600 border-2 border-amber-200"
                  : "bg-red-50 text-red-600 border-2 border-red-200"}`}
              >
                {urgentCount === 0 ? "✓" : urgentCount}
              </div>
              <div>
                <p className={`text-[12px] font-semibold leading-tight
                  ${urgentCount === 0 ? "text-emerald-700" : urgentCount <= 2 ? "text-amber-700" : "text-red-700"}`}>
                  {urgentCount === 0 ? "All clear" : urgentCount <= 2 ? "Needs attention" : "Urgent items"}
                </p>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                  {cards.length} total email{cards.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {/* Summary text */}
            <div className="flex gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-2">
              <span className="text-gray-300 text-[11px] flex-shrink-0 mt-0.5">✦</span>
              <p className="text-[11px] text-gray-500 leading-snug">{insight}</p>
            </div>

            {/* Category bar */}
            {cards.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {(
                  [
                    { label: "Action", count: cards.filter((c) => ["action","overdue"].includes(c.col)).length, color: rightPanel.categoryBarColor.action },
                    { label: "Invoices", count: invoiceCards.length, color: rightPanel.categoryBarColor.invoice },
                    { label: "Subs", count: cards.filter((c) => c.col === "sub").length, color: rightPanel.categoryBarColor.sub },
                    { label: "FYI", count: cards.filter((c) => c.col === "other").length, color: rightPanel.categoryBarColor.other },
                  ] as const
                ).filter((s) => s.count > 0).map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-12 flex-shrink-0">{stat.label}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stat.color}`}
                        style={{ width: `${Math.max(8, (stat.count / cards.length) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold tabular-nums w-4 text-right">{stat.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Overdue ── */}
        {overdueCards.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Overdue
              </span>
              <span className="ml-auto text-[10px] font-semibold text-red-500">
                {overdueCards.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {overdueCards.slice(0, 4).map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-lg border border-red-100 px-3 py-2 shadow-sm"
                >
                  <p className="text-[11px] font-semibold text-gray-800 leading-tight">
                    {truncate(card.task, 55)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${SENDER_TYPE_BADGE[card.senderType]}`}>
                      {SENDER_TYPE_LABEL[card.senderType]}
                    </span>
                    <span className="text-[9px] text-red-500 font-semibold">
                      {card.deadline ?? "Overdue"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Upcoming deadlines ── */}
        {upcomingCards.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Due Soon
              </span>
              <span className="ml-auto text-[10px] font-semibold text-amber-600">
                {upcomingCards.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {upcomingCards.slice(0, 4).map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-lg border border-amber-100 px-3 py-2 shadow-sm"
                >
                  <p className="text-[11px] font-semibold text-gray-800 leading-tight">
                    {truncate(card.task, 55)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${SENDER_TYPE_BADGE[card.senderType]}`}>
                      {SENDER_TYPE_LABEL[card.senderType]}
                    </span>
                    {card.deadline && (
                      <span className="text-[9px] text-amber-600 font-medium">
                        {card.deadline}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Invoices pending ── */}
        {invoiceCards.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Invoices
              </span>
              <span className="ml-auto text-[10px] font-semibold text-amber-600">
                {invoiceCards.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {invoiceCards.slice(0, 3).map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-lg border border-amber-100 px-3 py-2 shadow-sm"
                >
                  <p className="text-[11px] font-semibold text-gray-800 leading-tight">
                    {truncate(card.task, 55)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {truncate(card.sender, 30)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Recent ── */}
        {recentCards.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Recent
              </span>
            </div>
            <div className="space-y-1.5">
              {recentCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-lg border border-gray-100 px-3 py-2 shadow-sm flex items-start gap-2"
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${rightPanel.colDot[card.col] ?? "bg-gray-300"}`} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-gray-700 leading-tight truncate">
                      {truncate(card.task, 48)}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      {formatTime(card.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {cards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-lg">✦</span>
            </div>
            <p className="text-[12px] font-medium text-gray-500">No insights yet</p>
            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed max-w-[160px]">
              Insights will appear as emails arrive.
            </p>
          </div>
        )}

      </div>
    </aside>
  );
}
