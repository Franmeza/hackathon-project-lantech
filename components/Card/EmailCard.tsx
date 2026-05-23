"use client";

import { useState } from "react";
import type { Card, ColConfigMap } from "@/types";

interface EmailCardProps {
  card: Card;
  colConfig: ColConfigMap;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onArchive: (id: string) => void;
}

const ArchiveIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

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

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`bg-white rounded-xl p-3 mb-2 cursor-grab transition-colors border ${
        hovered ? cfg.border : "border-gray-200"
      } relative font-sans`}
    >
      {/* Archive button */}
      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onArchive(card.id);
          }}
          title="Archive"
          className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-gray-200 bg-gray-50 text-gray-500 text-[10px] font-medium hover:bg-gray-100 hover:text-gray-700 hover:border-gray-300 transition-colors"
        >
          <ArchiveIcon />
          Archive
        </button>
      )}

      {/* Header */}
      <div
        className={`flex justify-between items-start mb-1.5 ${
          hovered ? "pr-16" : ""
        }`}
      >
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 inline-block ${cfg.dot}`}
          />
          {card.sender}
        </span>
        <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">
          {card.time}
        </span>
      </div>

      {/* Task */}
      <p className="text-[13px] text-gray-800 leading-snug mb-1.5">
        {card.task}
      </p>

      {/* AI reason chip */}
      <div className="flex gap-1 items-start text-[11px] text-gray-500 bg-gray-50 border border-gray-100 rounded-md px-2 py-1 mb-2">
        <span className="opacity-50 flex-shrink-0">✦</span>
        {card.reason}
      </div>

      {/* Badges */}
      <div className="flex gap-1.5 flex-wrap">
        {card.deadline && (
          <span className="text-[11px] px-2 py-0.5 rounded-full border border-yellow-200 bg-yellow-50 text-yellow-800 flex items-center gap-1">
            ⏰ {card.deadline}
          </span>
        )}
        {card.reply && (
          <button
            onClick={() => setReplyOpen((v) => !v)}
            className="text-[11px] px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 transition-colors"
          >
            ✉ {replyOpen ? "Hide reply" : "Draft reply"}
          </button>
        )}
      </div>

      {/* Draft reply panel */}
      {replyOpen && card.reply && (
        <div className="mt-2 text-xs text-gray-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-2 leading-relaxed">
          {card.reply}
          <button
            onClick={copyReply}
            className="mt-1.5 block text-[11px] px-2 py-0.5 rounded-full border border-green-200 text-green-700 hover:bg-green-100 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
