"use client";

import { useState } from "react";
import type { Card, ColConfigMap } from "@/types";
import { AiChip } from "@/components/ui/AiChip";
import { Card as UiCard } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { DotIndicator } from "@/components/ui/DotIndicator";
import { Icon } from "@/components/ui/Icon";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { functionalColors, typography, cardHoverBorderByCol } from "@/lib/ui-tokens";

interface EmailCardProps {
  card: Card;
  colConfig: ColConfigMap;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onArchive: (id: string) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function EmailCard({
  card,
  colConfig,
  onDragStart,
  onDragEnd,
  onArchive,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}: EmailCardProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(card.reply);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

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

  const borderClass = hovered ? cardHoverBorderByCol[card.col] : "border-gray-200";
  const showArchiveButton = hovered && !selectionMode;

  return (
    <UiCard
      draggable={!selectionMode}
      borderClass={borderClass}
      className="cursor-grab transition-colors relative"
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {showArchiveButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onArchive(card.id);
          }}
          title="Archive"
          className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-gray-200 bg-gray-50 text-gray-500 text-[10px] font-medium hover:bg-gray-100 hover:text-gray-700 hover:border-gray-300 transition-colors"
        >
          <Icon name="archive" size="xs" />
          Archive
        </button>
      )}

      <div
        className={
          "flex justify-between items-start mb-1.5 " + (hovered ? "pr-16" : "")
        }
      >
        <span className={"flex items-center gap-2 " + typography.senderName}>
          {selectionMode && onToggleSelect && (
            <Checkbox
              checked={selected}
              onChange={() => onToggleSelect(card.id)}
              label={`Select ${card.task}`}
            />
          )}
          <DotIndicator colorClass={cfg.dot} />
          <button
            type="button"
            onClick={() => {
              if (!selectionMode || !onToggleSelect) return;
              onToggleSelect(card.id);
            }}
            className="text-left"
          >
            {card.sender}
          </button>
        </span>
        <RelativeTime
          date={card.createdAt}
          className={typography.meta + " whitespace-nowrap ml-2"}
        />
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
            onClick={generateDraft}
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
            onClick={() => setReplyOpen((v) => !v)}
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
              onClick={copyDraft}
              className="text-[11px] px-2 py-0.5 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={generateDraft}
              disabled={generating}
              className="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {generating ? "Regenerating…" : "Regenerate"}
            </button>
          </div>
        </div>
      )}
    </UiCard>
  );
}
