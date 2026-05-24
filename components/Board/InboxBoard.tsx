"use client";

import { useRef, useState } from "react";
import { useCards } from "@/hooks/useCards";
import { useCardSelection } from "@/hooks/useCardSelection";
import { COL_CONFIG, TILE_DEFINITIONS } from "@/lib/col-config";
import { bulkArchive, bulkReclassify, bulkRestore } from "@/lib/cards-api";
import { Column } from "@/components/Board/Column";
import { ActionDetailView } from "@/components/Board/ActionDetailView";
import { ArchiveView } from "@/components/Archive/ArchiveView";
import { BulkActionBar } from "@/components/Board/BulkActionBar";
import { BulkConfirmDialog } from "@/components/Board/BulkConfirmDialog";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { DashboardView } from "@/components/Dashboard/DashboardView";
import { Button } from "@/components/ui/Button";
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

  const selection = useCardSelection();
  const [bulkBusy, setBulkBusy] = useState(false);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: null | (() => Promise<void>);
  }>({ open: false, title: "", description: "", action: null });

  const activeCards = allCards.filter((c) => !c.archived);
  const archivedCards = allCards.filter((c) => c.archived);

  const detailTile = TILE_DEFINITIONS.find((t) => t.id === detailTileId) ?? null;
  const detailCards = detailTile
    ? activeCards.filter((c) => detailTile.cols.includes(c.col))
    : [];
  const showDetailBulkActions = Boolean(detailTileId) && detailCards.length > 0;

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

  function handleTileClick(tileId: string) {
    setDetailTileId(tileId);
  }

  function handleBackToDashboard() {
    setDetailTileId(null);
    setMainView("dashboard");
    selection.exitMode();
  }

  function handleSidebarNavigate(view: "inbox" | "archive") {
    setDetailTileId(null);
    setMainView(view === "inbox" ? "dashboard" : "archive");
    selection.exitMode();
  }

  const sidebarView = mainView === "archive" ? "archive" : "inbox";

  const bulkContext =
    mainView === "archive" ? "archive" : detailTileId ? "inbox" : "inbox";

  function requestConfirm(
    title: string,
    description: string,
    action: () => Promise<void>
  ) {
    setConfirm({ open: true, title, description, action });
  }

  async function runBulk(action: () => Promise<void>) {
    setBulkBusy(true);
    try {
      await action();
      selection.exitMode();
      mutate();
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleBulkArchiveSelected() {
    const ids = selection.selectedIds;
    await runBulk(async () => {
      await bulkArchive({ ids });
    });
  }

  async function handleBulkRestoreSelected() {
    const ids = selection.selectedIds;
    await runBulk(async () => {
      await bulkRestore({ ids });
    });
  }

  async function handleBulkReclassifySelected(col: ColId) {
    const ids = selection.selectedIds;
    await runBulk(async () => {
      await bulkReclassify({ ids }, col);
    });
  }

  async function handleQuickArchiveAll(tileId: string) {
    const tile = TILE_DEFINITIONS.find((t) => t.id === tileId);
    if (!tile) return;

    const count = activeCards.filter((c) => tile.cols.includes(c.col)).length;
    const isSensitive = tileId === "invoice" || tileId === "action";
    const title = `Archive ${count} items?`;
    const description = "These items will move to Archive. You can restore them later.";

    const action = async () => {
      await bulkArchive({ filter: { cols: tile.cols, archived: false } });
    };

    if (isSensitive) requestConfirm(title, description, action);
    else await runBulk(action);
  }

  async function handleQuickRestoreAll(ids: string[]) {
    const title = `Restore ${ids.length} items?`;
    const description = "These items will move back to your active board.";
    const action = async () => {
      await bulkRestore({ ids });
    };
    if (ids.length > 10) requestConfirm(title, description, action);
    else await runBulk(action);
  }

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
        {selection.selectionMode && (
          <BulkActionBar
            context={mainView === "archive" ? "archive" : "inbox"}
            count={selection.selectedCount}
            busy={bulkBusy}
            onCancel={selection.exitMode}
            onArchive={() => {
              const title = `Archive ${selection.selectedCount} items?`;
              const description =
                "These items will move to Archive. You can restore them later.";
              requestConfirm(title, description, handleBulkArchiveSelected);
            }}
            onRestore={() => {
              const title = `Restore ${selection.selectedCount} items?`;
              const description =
                "These items will move back to your active board.";
              requestConfirm(title, description, handleBulkRestoreSelected);
            }}
            onReclassify={(col) => {
              const title = `Reclassify ${selection.selectedCount} items?`;
              const description =
                "This will change the category for the selected items.";
              requestConfirm(title, description, () => handleBulkReclassifySelected(col));
            }}
          />
        )}

        {mainView === "archive" && (
          <ArchiveView
            archived={archivedCards}
            colConfig={COL_CONFIG}
            onRestore={handleRestore}
            onRestoreAll={handleQuickRestoreAll}
            selectionMode={selection.selectionMode}
            onEnterSelection={selection.enterMode}
            onExitSelection={selection.exitMode}
            isSelected={selection.isSelected}
            onToggleSelect={selection.toggle}
          />
        )}

        {mainView === "dashboard" && !detailTileId && (
          <DashboardView
            activeCards={activeCards}
            onTileClick={handleTileClick}
            onExtracted={mutate}
            userEmail={userEmail}
          />
        )}

        {mainView === "dashboard" && detailTileId && detailTile && (
          <>
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

              {showDetailBulkActions && (
                <div className="ml-auto flex items-center gap-2 shrink-0">
                  {!selection.selectionMode ? (
                    <>
                      <Button variant="toolbar" onClick={selection.enterMode}>
                        Select
                      </Button>
                      <Button
                        variant="toolbar"
                        onClick={() => void handleQuickArchiveAll(detailTileId)}
                      >
                        Archive all
                      </Button>
                    </>
                  ) : (
                    <Button variant="toolbar" onClick={selection.exitMode}>
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </div>

            {detailTileId === "action" ? (
              <ActionDetailView
                cards={detailCards}
                colConfig={COL_CONFIG}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onArchive={handleArchive}
                selectionMode={selection.selectionMode}
                isSelected={selection.isSelected}
                onToggleSelect={selection.toggle}
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
                    selectionMode={selection.selectionMode}
                    isSelected={selection.isSelected}
                    onToggleSelect={selection.toggle}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {mainView === "dashboard" && !detailTileId && (
        <RightPanel cards={activeCards} />
      )}

      <BulkConfirmDialog
        open={confirm.open}
        title={confirm.title}
        description={confirm.description}
        confirming={bulkBusy}
        confirmText="Confirm"
        cancelText="Cancel"
        onCancel={() => setConfirm({ open: false, title: "", description: "", action: null })}
        onConfirm={async () => {
          if (!confirm.action) return;
          const action = confirm.action;
          setConfirm({ open: false, title: "", description: "", action: null });
          await runBulk(action);
        }}
      />
    </div>
  );
}
