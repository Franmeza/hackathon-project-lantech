"use client";

import { useState } from "react";
import type { Card, ColConfigMap } from "@/types";
import { Card as UiCard } from "@/components/ui/Card";
import { DotIndicator } from "@/components/ui/DotIndicator";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { functionalColors, typography } from "@/lib/ui-tokens";

interface ArchiveCardProps {
  card: Card;
  colConfig: ColConfigMap;
  onRestore: (id: string) => void;
}

export function ArchiveCard({ card, colConfig, onRestore }: ArchiveCardProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const cfg = colConfig[card.col];

  return (
    <UiCard variant="archived">
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-1.5">
          <DotIndicator colorClass={cfg.dot} />
          <span className={typography.senderNameMuted}>{card.sender}</span>
          <Pill small bg={cfg.pillBg} text={cfg.pillText} border={cfg.pillBorder}>
            {cfg.label}
          </Pill>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={typography.meta}>{card.time}</span>
          <button
            onClick={() => onRestore(card.id)}
            className="text-[10px] px-2 py-0.5 rounded-md border border-gray-200 text-gray-500 font-medium hover:border-gray-300 hover:text-gray-700 transition-colors"
          >
            Restore
          </button>
        </div>
      </div>

      <p className={typography.bodyMuted + " mb-1.5"}>{card.task}</p>

      {card.reply && (
        <button
          onClick={() => setReplyOpen((v) => !v)}
          className={functionalColors.draftReply + " inline-flex items-center gap-1"}
        >
          <Icon name="message-reply" size="xs" />
          {replyOpen ? "Hide reply" : "Draft reply"}
        </button>
      )}

      {replyOpen && card.reply && (
        <div className={functionalColors.replyPanel}>{card.reply}</div>
      )}
    </UiCard>
  );
}
