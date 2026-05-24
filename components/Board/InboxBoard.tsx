"use client";

import { useRef, useState } from "react";
import { useCards } from "@/hooks/useCards";
import { COL_CONFIG, TILE_DEFINITIONS } from "@/lib/col-config";
import { Column } from "@/components/Board/Column";
import { ActionDetailView } from "@/components/Board/ActionDetailView";
import { ArchiveView } from "@/components/Archive/ArchiveView";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { DashboardView } from "@/components/Dashboard/DashboardView";
import { LogOutButton } from "@/components/Auth/LogOutButton";
import { RightPanel } from "@/components/RightPanel/RightPanel";
import type { Card, ColId } from "@/types";
type MainView = "dashboard" | "archive";

interface InboxBoardProps {
  initialCards?: Card[];
  userEmail?: string;
}

export function InboxBoard({ initialCards, userEmail }: InboxBoardProps) {
  const { cards: allCards, mutate } = useCards(initialCards);
  const [mainView, setMainView] = useState<MainView>("dashboard");
  const [detailTileId, setDetailTileId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<ColId | null>(null);
  const draggingId = useRef<string | null>(null);

  const activeCards = allCards.filter((c) => !c.archived);
  const archivedCards = allCards.filter((c) => c.archived);

  // Resolve which ColIds belong to the open detail tile
  const detailTile = TILE_DEFINITIONS.find((t) => t.id === detailTileId) ?? null;
  const detailCards = detailTile
    ? activeCards.filter((c) => detailTile.cols.includes(c.col))
    : [];

  // ── Drag and drop ──────────────────────────────────────────────────────────

  function onDragStart(e: React.DragEvent, id: string) {
    draggingId.current = id;
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragEnd() {
    draggingId.current = null;
    setDragOver(null);
  }

  function onDragOver(colId: ColId) {
    setDragOver(colId);
  }

  function onDragLeave() {
    setDragOver(null);
  }

  async function onDrop(e: React.DragEvent, colId: ColId) {
    e.preventDefault();
    setDragOver(null);
    const id = draggingId.current;
    if (!id) return;
    draggingId.current = null;

    await fetch("/api/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, col: colId }),
    });

    mutate();
  }

  // ── Archive / restore ──────────────────────────────────────────────────────

  async function handleArchive(id: string) {
    await fetch("/api/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, archived: true }),
    });
    mutate();
  }

  async function handleRestore(id: string) {
    await fetch("/api/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, archived: false }),
    });
    mutate();
  }

  // ── Navigation helpers ─────────────────────────────────────────────────────

  function handleTileClick(tileId: string) {
    setDetailTileId(tileId);
  }

  function handleBackToDashboard() {
    setDetailTileId(null);
    setMainView("dashboard");
  }

  function handleSidebarNavigate(view: "inbox" | "archive") {
    setDetailTileId(null);
    setMainView(view === "inbox" ? "dashboard" : "archive");
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const sidebarView = mainView === "archive" ? "archive" : "inbox";

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* Left nav sidebar */}
      <Sidebar
        view={sidebarView}
        onNavigate={handleSidebarNavigate}
        archiveCount={archivedCards.length}
        userEmail={userEmail}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 px-8 py-8">
        {/* ── Archive view ── */}
        {mainView === "archive" && (
          <ArchiveView
            archived={archivedCards}
            colConfig={COL_CONFIG}
            onRestore={handleRestore}
          />
        )}

        {/* ── Dashboard view ── */}
        {mainView === "dashboard" && !detailTileId && (
          <DashboardView
            activeCards={activeCards}
            onTileClick={handleTileClick}
            onExtracted={mutate}
            userEmail={userEmail}
          />
        )}

        {/* ── Column detail view ── */}
        {mainView === "dashboard" && detailTileId && detailTile && (
          <>
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400 hover:text-gray-700 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7.5 1.5L3 6l4.5 4.5"/>
                  </svg>
                  Back
                </button>
                <span className="text-gray-200">/</span>
                <span className="text-xl">{detailTile.icon}</span>
                <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">
                  {detailTile.label}
                </h1>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${detailTile.id === "action" ? "border-red-200 bg-red-50 text-red-700" : "border-gray-200 bg-gray-100 text-gray-600"}`}>
                  {detailCards.length}
                </span>
              </div>
              <LogOutButton />
            </div>

            {/* Column layout — Action Required gets 3 semantic columns */}
            {detailTileId === "action" ? (
              <ActionDetailView
                cards={detailCards}
                colConfig={COL_CONFIG}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onArchive={handleArchive}
              />
            ) : (
              <div
                className={`grid gap-4 ${
                  detailTile.cols.length > 1 ? "grid-cols-2" : "grid-cols-1 max-w-md"
                }`}
              >
                {detailTile.cols.map((colId) => (
                  <Column
                    key={colId}
                    colId={colId}
                    cards={activeCards.filter((c) => c.col === colId)}
                    config={COL_CONFIG}
                    dragOver={dragOver}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onArchive={handleArchive}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Right AI insights panel — only on dashboard overview */}
      {mainView === "dashboard" && !detailTileId && (
        <RightPanel cards={activeCards} />
      )}
    </div>
  );
}
