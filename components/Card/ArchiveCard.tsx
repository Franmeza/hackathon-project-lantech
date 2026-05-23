"use client";

import { useState } from "react";
import type { Card, ColConfigMap } from "@/types";

interface ArchiveCardProps {
  card: Card;
  colConfig: ColConfigMap;
  onRestore: (id: string) => void;
}

export function ArchiveCard({ card, colConfig, onRestore }: ArchiveCardProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const cfg = colConfig[card.col];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 mb-2 opacity-85 font-sans">
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 inline-block ${cfg.dot}`} />
          <span className="text-xs font-semibold text-gray-600">{card.sender}</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${cfg.pillBg} ${cfg.pillText} ${cfg.pillBorder}`}
          >
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-400">{card.time}</span>
          <button
            onClick={() => onRestore(card.id)}
            className="text-[10px] px-2 py-0.5 rounded-md border border-gray-200 text-gray-500 font-medium hover:border-gray-300 hover:text-gray-700 transition-colors"
          >
            Restore
          </button>
        </div>
      </div>

      <p className="text-[13px] text-gray-500 leading-snug mb-1.5">{card.task}</p>

      {card.reply && (
        <button
          onClick={() => setReplyOpen((v) => !v)}
          className="text-[11px] px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 transition-colors"
        >
          ✉ {replyOpen ? "Hide reply" : "Draft reply"}
        </button>
      )}

      {replyOpen && card.reply && (
        <div className="mt-2 text-xs text-gray-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-2 leading-relaxed">
          {card.reply}
        </div>
      )}
    </div>
  );
}
