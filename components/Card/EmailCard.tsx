"use client";

import { useState } from "react";
import type { Card, ColConfigMap } from "@/types";
import { AiChip } from "@/components/ui/AiChip";
import { Card as UiCard } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { DotIndicator } from "@/components/ui/DotIndicator";
import { Icon } from "@/components/ui/Icon";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { functionalColors, cardHoverBorderByCol, emailCardLayout, typography } from "@/lib/ui-tokens";
import { MessageModal } from "@/components/Card/MessageModal";

interface EmailCardProps {
  card: Card;
  colConfig: ColConfigMap;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onArchive: (id: string) => void;
  onDeleted?: (id: string) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  exitingIds?: Set<string>;
}

export function EmailCard({
  card,
  colConfig,
  onDragStart,
  onDragEnd,
  onArchive,
  onDeleted,
  selectionMode = false,
  selected = false,
  onToggleSelect,
  exitingIds,
}: EmailCardProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(card.reply);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selfExiting, setSelfExiting] = useState(false);

  const isExiting = selfExiting || (exitingIds?.has(card.id) ?? false);

  const cfg = colConfig[card.col];
  const isActionable = card.col === "action" || card.col === "overdue";

  function archiveWithAnimation() {
    setSelfExiting(true);
    setTimeout(() => onArchive(card.id), 200);
  }

  function handleDeletedFromModal() {
    setSelfExiting(true);
    setTimeout(() => onDeleted?.(card.id), 200);
  }

  async function generateDraft() {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch(`/api/cards/${card.id}/draft`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate draft");
      const data = (await res.json()) as { reply: string };
      setDraft(data.reply);
      setReplyOpen(true);
    } catch {
      setGenError("Could not generate draft. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  function copyDraft() {
    if (!draft) return;
    navigator.clipboard.writeText(draft).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const borderClass = hovered ? cardHoverBorderByCol[card.col] : "border-gray-200";
  const showArchiveButton = hovered && !selectionMode;

  return (
    <>
      <div
        className={`transition-all duration-200 ease-out ${
          isExiting
            ? "opacity-0 scale-[0.96] -translate-y-1 pointer-events-none"
            : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        <UiCard
          draggable={!selectionMode}
          borderClass={borderClass}
          className="cursor-grab transition-colors relative"
          onClick={() => {
            if (selectionMode) onToggleSelect?.(card.id);
            else setModalOpen(true);
          }}
          onDragStart={(e) => onDragStart(e, card.id)}
          onDragEnd={onDragEnd}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {showArchiveButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                archiveWithAnimation();
              }}
              title="Archive"
              className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-gray-200 bg-gray-50 text-gray-500 text-[10px] font-medium hover:bg-gray-100 hover:text-gray-700 hover:border-gray-300 transition-colors"
            >
              <Icon name="archive" size="xs" />
              <span className="hidden sm:inline">Archive</span>
            </button>
          )}

          <div
            className={
              emailCardLayout.topRow + (hovered ? " sm:pr-16" : "")
            }
          >
            <span className={emailCardLayout.senderRow + " " + typography.senderName}>
              {selectionMode && onToggleSelect && (
                <Checkbox
                  checked={selected}
                  onChange={() => onToggleSelect(card.id)}
                  label={`Select ${card.task}`}
                />
              )}
              <DotIndicator colorClass={cfg.dot} className="mt-1 shrink-0" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!selectionMode || !onToggleSelect) return;
                  onToggleSelect(card.id);
                }}
                className={emailCardLayout.senderName}
              >
                {card.sender}
              </button>
            </span>
            <RelativeTime
              date={card.createdAt}
              className={emailCardLayout.time}
            />
          </div>

          <p className={emailCardLayout.task}>{card.task}</p>

          <AiChip className="mb-2 break-words">{card.reason}</AiChip>

          <div className={emailCardLayout.actions}>
            {card.deadline && (
              <span className={functionalColors.deadline + " flex items-center gap-1"}>
                <Icon name="clock" size="xs" />
                {card.deadline}
              </span>
            )}

            {isActionable && !draft && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  void generateDraft();
                }}
                disabled={generating}
                className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin inline-block" />
                    Writing…
                  </>
                ) : (
                  <>
                    <Icon name="message-reply" size="xs" />
                    <span className="hidden sm:inline">Generate draft</span>
                    <span className="sm:hidden">Draft</span>
                  </>
                )}
              </button>
            )}

            {draft && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setReplyOpen((v) => !v);
                }}
                className={functionalColors.draftReply + " inline-flex items-center gap-1"}
              >
                <Icon name="message-reply" size="xs" />
                <span className="hidden sm:inline">
                  {replyOpen ? "Hide draft" : "View draft"}
                </span>
                <span className="sm:hidden">{replyOpen ? "Hide" : "Draft"}</span>
              </button>
            )}
          </div>

          {genError && <p className={functionalColors.errorText}>{genError}</p>}

          {replyOpen && draft && (
            <div className="mt-2.5 text-xs text-gray-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 leading-relaxed whitespace-pre-wrap">
              {draft}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyDraft();
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void generateDraft();
                  }}
                  disabled={generating}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {generating ? "…" : (
                    <>
                      <span className="hidden sm:inline">Regenerate</span>
                      <span className="sm:hidden">Redo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </UiCard>
      </div>

      {modalOpen && (
        <MessageModal
          card={card}
          onClose={() => setModalOpen(false)}
          onArchive={archiveWithAnimation}
          onDeleted={handleDeletedFromModal}
        />
      )}
    </>
  );
}
