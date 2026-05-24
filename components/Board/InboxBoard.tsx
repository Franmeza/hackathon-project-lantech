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
import { RightPanel } from "@/components/RightPanel/RightPanel";
import { layout, typography, functionalColors } from "@/lib/ui-tokens";
import type { Card, ColId } from "@/types";

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

  // ── Selection ──────────────────────────────────────────────────────────────
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  const activeCards = allCards.filter((c) => !c.archived);
  const archivedCards = allCards.filter((c) => c.archived);

  const detailTile = TILE_DEFINITIONS.find((t) => t.id === detailTileId) ?? null;
  const detailCards = detailTile
    ? activeCards.filter((c) => detailTile.cols.includes(c.col))
    : [];

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

  function enterSelectMode() {
    setIsSelecting(true);
    setSelectedIds(new Set());
    setConfirmingDelete(false);
    setConfirmingArchive(false);
  }

  function exitSelectMode() {
    setIsSelecting(false);
    setSelectedIds(new Set());
    setConfirmingDelete(false);
    setConfirmingArchive(false);
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSelectAll(cardIds: string[]) {
    setSelectedIds(new Set(cardIds));
  }

  async function handleDeleteSelected() {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setExitingIds(new Set(ids));
    await new Promise((r) => setTimeout(r, 220));
    await fetch(`/api/cards?ids=${ids.join(",")}`, { method: "DELETE" });
    exitSelectMode();
    mutate();
    setExitingIds(new Set());
  }

  async function handleArchiveSelected() {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setExitingIds(new Set(ids));
    await new Promise((r) => setTimeout(r, 220));
    await Promise.all(
      ids.map((id) =>
        fetch("/api/cards", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, archived: true }),
        })
      )
    );
    exitSelectMode();
    mutate();
    setExitingIds(new Set());
  }

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

  const sidebarView = mainView === "archive" ? "archive" : "inbox";

  return (
    <div className="flex min-h-screen w-full font-sans">
      <Sidebar
        view={sidebarView}
        onNavigate={handleSidebarNavigate}
        archiveCount={archivedCards.length}
        userName={userName}
        userEmail={userEmail}
      />

      <div className={layout.mainContent}>
        {mainView === "archive" && (
          <div key="archive" className="page-enter">
            <ArchiveView
              archived={archivedCards}
              colConfig={COL_CONFIG}
              onRestore={handleRestore}
            />
          </div>
        )}

        {mainView === "dashboard" && !detailTileId && (
          <div key="dashboard" className="page-enter">
            <DashboardView
              activeCards={activeCards}
              onTileClick={handleTileClick}
              onExtracted={mutate}
              userEmail={userEmail}
            />
          </div>
        )}

        {mainView === "dashboard" && detailTileId && detailTile && (
          <div key={`detail-${detailTileId}`} className="page-enter-detail"><>
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

              <div className="ml-auto">
                {isSelecting ? (
                  <button
                    onClick={exitSelectMode}
                    className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={enterSelectMode}
                    className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
                  >
                    <Icon name="checkbox" size="xs" />
                    Select
                  </button>
                )}
              </div>
            </div>

            {detailTileId === "action" ? (
              <ActionDetailView
                cards={detailCards}
                colConfig={COL_CONFIG}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onArchive={handleArchive}
                isSelecting={isSelecting}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                exitingIds={exitingIds}
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
                    isSelecting={isSelecting}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    exitingIds={exitingIds}
                  />
                ))}
              </div>
            )}
          </></div>
        )}
      </div>

      {mainView === "dashboard" && !detailTileId && (
        <RightPanel cards={activeCards} />
      )}

      {/* ── Floating selection action bar ── */}
      {isSelecting && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 bg-gray-900 text-white text-[12px] rounded-2xl px-4 py-2.5 shadow-2xl shadow-gray-900/30 transition-all"
          style={{ fontFamily: "inherit" }}
        >
          {confirmingDelete ? (
            <>
              <span className="text-white/60 mr-1">
                Move {selectedIds.size} email{selectedIds.size !== 1 ? "s" : ""} to Gmail trash?
              </span>
              <button
                onClick={handleDeleteSelected}
                className="font-semibold text-red-400 hover:text-red-300 transition-all active:scale-95 px-2 py-0.5 rounded-lg hover:bg-white/10"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="text-white/40 hover:text-white/70 transition-all active:scale-95 px-2 py-0.5 rounded-lg hover:bg-white/10"
              >
                Back
              </button>
            </>
          ) : confirmingArchive ? (
            <>
              <span className="text-white/60 mr-1">
                Archive {selectedIds.size} email{selectedIds.size !== 1 ? "s" : ""}?
              </span>
              <button
                onClick={handleArchiveSelected}
                className="font-semibold text-amber-400 hover:text-amber-300 transition-all active:scale-95 px-2 py-0.5 rounded-lg hover:bg-white/10"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmingArchive(false)}
                className="text-white/40 hover:text-white/70 transition-all active:scale-95 px-2 py-0.5 rounded-lg hover:bg-white/10"
              >
                Back
              </button>
            </>
          ) : (
            <>
              <span className="font-medium text-white/80 px-1">
                {selectedIds.size} selected
              </span>

              {selectedIds.size < detailCards.length && (
                <>
                  <span className="w-px h-3.5 bg-white/20 mx-1" />
                  <button
                    onClick={() => handleSelectAll(detailCards.map((c) => c.id))}
                    className="text-white/50 hover:text-white/80 transition-colors px-2 py-0.5 rounded-lg hover:bg-white/10"
                  >
                    Select all {detailCards.length}
                  </button>
                </>
              )}

              {selectedIds.size > 0 && (
                <>
                  <span className="w-px h-3.5 bg-white/20 mx-1" />
                  <button
                    onClick={() => setConfirmingArchive(true)}
                    className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium transition-all active:scale-95 px-2 py-0.5 rounded-lg hover:bg-white/10"
                  >
                    <Icon name="archive" size="xs" />
                    Archive
                  </button>
                  <span className="w-px h-3.5 bg-white/20 mx-1" />
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium transition-all active:scale-95 px-2 py-0.5 rounded-lg hover:bg-white/10"
                  >
                    <Icon name="trash" size="xs" />
                    Delete
                  </button>
                </>
              )}

              <span className="w-px h-3.5 bg-white/20 mx-1" />
              <button
                onClick={exitSelectMode}
                className="text-white/30 hover:text-white/60 transition-colors px-2 py-0.5 rounded-lg hover:bg-white/10"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
