"use client";

import { useState } from "react";
import type { Card, ColConfigMap } from "@/types";
import { AiChip } from "@/components/ui/AiChip";
import { Card as UiCard } from "@/components/ui/Card";
import { DotIndicator } from "@/components/ui/DotIndicator";
import { Icon } from "@/components/ui/Icon";
import { functionalColors, typography, cardHoverBorderByCol } from "@/lib/ui-tokens";

interface EmailCardProps {
  card: Card;
  colConfig: ColConfigMap;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onArchive: (id: string) => void;
}

export function EmailCard({
  card,
  colConfig,
  onDragStart,
  onDragEnd,
  onArchive,
}: EmailCardProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cfg = colConfig[card.col];

  function copyReply() {
    if (!card.reply) return;
    navigator.clipboard.writeText(card.reply).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const borderClass = hovered
    ? cardHoverBorderByCol[card.col]
    : "border-gray-200";

  return (
    <UiCard
      draggable
      borderClass={borderClass}
      className="cursor-grab transition-colors relative"
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
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
        <span className={"flex items-center gap-1.5 " + typography.senderName}>
          <DotIndicator colorClass={cfg.dot} />
          {card.sender}
        </span>
        <span className={typography.meta + " whitespace-nowrap ml-2"}>
          {card.time}
        </span>
      </div>

      <p className={typography.body + " mb-1.5"}>{card.task}</p>

      <AiChip className="mb-2">{card.reason}</AiChip>

      <div className="flex gap-1.5 flex-wrap">
        {card.deadline && (
          <span className={functionalColors.deadline + " flex items-center gap-1"}>
            <Icon name="clock" size="xs" />
            {card.deadline}
          </span>
        )}
        {card.reply && (
          <button
            onClick={() => setReplyOpen((v) => !v)}
            className={functionalColors.draftReply + " inline-flex items-center gap-1"}
          >
            <Icon name="message-reply" size="xs" />
            {replyOpen ? "Hide reply" : "Draft reply"}
          </button>
        )}
      </div>

      {replyOpen && card.reply && (
        <div className={functionalColors.replyPanel}>
          {card.reply}
          <button onClick={copyReply} className={functionalColors.copyButton}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </UiCard>
  );
}
