"use client";

import { useState } from "react";
import type { Card, ColConfigMap } from "@/types";
import { AiChip } from "@/components/ui/AiChip";
import { Card as UiCard } from "@/components/ui/Card";
import { DotIndicator } from "@/components/ui/DotIndicator";
import { Icon } from "@/components/ui/Icon";
import { functionalColors, typography, cardHoverBorderByCol } from "@/lib/ui-tokens";
import { MessageModal } from "@/components/Card/MessageModal";

interface EmailCardProps {
  card: Card;
  colConfig: ColConfigMap;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onArchive: (id: string) => void;
  isSelecting?: boolean;
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
  isSelecting = false,
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

  function archiveWithAnimation() {
    setSelfExiting(true);
    setTimeout(() => onArchive(card.id), 200);
  }

  function handleDeletedAnimation() {
    setSelfExiting(true);
  }

  const cfg = colConfig[card.col];
  const isActionable = card.col === "action" || card.col === "overdue";

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

  const borderClass = selected
    ? "border-indigo-300"
    : hovered
    ? cardHoverBorderByCol[card.col]
    : "border-gray-200";

  const bgClass = selected ? "bg-indigo-50/40" : "";

  return (
    <>
    <div
      className={`transition-all duration-200 ease-out ${
        isExiting ? "opacity-0 scale-[0.96] -translate-y-1 pointer-events-none" : "opacity-100 scale-100 translate-y-0"
      }`}
    >
    <UiCard
      draggable={!isSelecting}
      borderClass={borderClass}
      className={`cursor-pointer transition-colors relative active:scale-[0.98] active:shadow-none ${bgClass}`}
      onClick={() => isSelecting ? onToggleSelect?.(card.id) : setModalOpen(true)}
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
        <div
        className="flex justify-between items-start mb-1.5"
      >
        <span className={"flex items-center gap-1.5 " + typography.senderName}>
          {isSelecting && (
            <span
              className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                selected ? "bg-indigo-500 border-indigo-500" : "border-gray-300 bg-white"
              }`}
            >
              {selected && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          )}
          <DotIndicator colorClass={cfg.dot} />
          {card.sender}
        </span>
        <span className={typography.meta + " whitespace-nowrap ml-2"}>
          {card.time}
        </span>
      </div>

      <p className={typography.body + " mb-1.5"}>{card.task}</p>

      <AiChip className="mb-2">{card.reason}</AiChip>

      <div className="flex gap-1.5 flex-wrap items-center">
        {card.deadline && (
          <span className={functionalColors.deadline + " flex items-center gap-1"}>
            <Icon name="clock" size="xs" />
            {card.deadline}
          </span>
        )}

        {isActionable && !draft && (
          <button
            onClick={(e) => { e.stopPropagation(); generateDraft(); }}
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
                Generate draft
              </>
            )}
          </button>
        )}

        {draft && (
          <button
            onClick={(e) => { e.stopPropagation(); setReplyOpen((v) => !v); }}
            className={functionalColors.draftReply + " inline-flex items-center gap-1"}
          >
            <Icon name="message-reply" size="xs" />
            {replyOpen ? "Hide draft" : "View draft"}
          </button>
        )}
      </div>

      {genError && <p className={functionalColors.errorText}>{genError}</p>}

      {replyOpen && draft && (
        <div className="mt-2.5 text-xs text-gray-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 leading-relaxed whitespace-pre-wrap">
          {draft}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-100">
            <button
              onClick={(e) => { e.stopPropagation(); copyDraft(); }}
              className="text-[11px] px-2 py-0.5 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); generateDraft(); }}
              disabled={generating}
              className="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {generating ? "Regenerating…" : "Regenerate"}
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
        onDeleted={handleDeletedAnimation}
      />
    )}
    </>
  );
}
