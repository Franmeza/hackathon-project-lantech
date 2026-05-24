"use client";

import { useRef, useState } from "react";
import { useCards } from "@/hooks/useCards";
import { COL_CONFIG, TILE_DEFINITIONS } from "@/lib/col-config";
import { Column } from "@/components/Board/Column";
import { ActionDetailView } from "@/components/Board/ActionDetailView";
import { ArchiveView } from "@/components/Archive/ArchiveView";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { DashboardView } from "@/components/Dashboard/DashboardView";
import { Icon, TileIcon, type TileIconId } from "@/components/ui/Icon";
import { layout, typography, functionalColors } from "@/lib/ui-tokens";
import type { Card, ColId } from "@/types";

// Main nav: dashboard | archive
// Detail nav: the tile id clicked (maps to a TILE_DEFINITION)
type MainView = "dashboard" | "archive";

interface InboxBoardProps {
  initialCards?: Card[];
  userName?: string;
  userEmail?: string;
}

export function InboxBoard({ initialCards, userName, userEmail }: InboxBoardProps) {
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
    <div className="flex gap-0 min-h-screen w-full font-sans">
      {/* Sidebar — left */}
      <Sidebar
        view={sidebarView}
        onNavigate={handleSidebarNavigate}
        archiveCount={archivedCards.length}
        userName={userName}
        userEmail={userEmail}
      />

      {/* Main content */}
      <div className={layout.mainContent}>
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
          />
        )}

        {/* ── Column detail view ── */}
        {mainView === "dashboard" && detailTileId && detailTile && (
          <>
            {/* Header with back button */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Icon name="chevron-left" size="sm" />
                Back
              </button>
              <span className="text-gray-300">/</span>
              <span className="flex items-center">
                <TileIcon tileId={detailTileId as TileIconId} size="md" className="text-gray-700" />
              </span>
              <h1 className={typography.pageTitle}>{detailTile.label}</h1>
              <span
                className={
                  detailTile.id === "action"
                    ? functionalColors.emailCount
                    : functionalColors.detailEmailCountDefault
                }
              >
                {detailCards.length} emails
              </span>
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
                className={
                  detailTile.cols.length > 1
                    ? layout.detailColumnGridTwo
                    : layout.detailColumnGridOne
                }
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
    </div>
  );
}
