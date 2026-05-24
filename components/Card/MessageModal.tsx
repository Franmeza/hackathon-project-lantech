"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ParsedEmail } from "@/lib/gmail";
import type { Card } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseFrom(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) return { name: match[1].replace(/^"|"$/g, "").trim(), email: match[2].trim() };
  return { name: raw.trim(), email: raw.trim() };
}

function formatDate(raw: string): string {
  try {
    return new Date(raw).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return raw;
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}


// ─── Component ───────────────────────────────────────────────────────────────

interface MessageModalProps {
  card: Card;
  onClose: () => void;
  onArchive?: () => void;
  onDeleted?: () => void;
}

type FetchState =
  | { status: "loading" }
  | { status: "success"; email: ParsedEmail }
  | { status: "error"; message: string }
  | { status: "no-gmail" };

export function MessageModal({ card, onClose, onArchive, onDeleted }: MessageModalProps) {
  const [state, setState] = useState<FetchState>(
    card.gmailMsgId ? { status: "loading" } : { status: "no-gmail" }
  );
  const [visible, setVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 150);
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/cards?id=${card.id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setDeleteError(data.error ?? "Could not delete this message.");
        return;
      }
      onDeleted?.();
      handleClose();
    } catch {
      setDeleteError("Network error — please try again.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleArchive() {
    if (!onArchive) return;
    setArchiving(true);
    handleClose();
    setTimeout(onArchive, 150);
  }

  // Fetch
  useEffect(() => {
    if (!card.gmailMsgId) return;
    let cancelled = false;
    fetch(`/api/cards/${card.id}/message`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: string };
          setState({ status: "error", message: err.error ?? "Failed to load message" });
          return;
        }
        const email = await res.json() as ParsedEmail;
        if (!cancelled) setState({ status: "success", email });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", message: "Network error — please try again." });
      });
    return () => { cancelled = true; };
  }, [card.id, card.gmailMsgId]);

  // Enter animation
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) handleClose();
  }

  // Derived header data
  const sender =
    state.status === "success"
      ? parseFrom(state.email.from)
      : { name: card.sender, email: "" };

  const subject =
    state.status === "success"
      ? state.email.subject || "(no subject)"
      : card.task;

  const dateStr =
    state.status === "success" ? formatDate(state.email.date) : card.time;

  const gmailLink =
    state.status === "success"
      ? `https://mail.google.com/mail/u/0/#inbox/${state.email.messageId}`
      : null;

  const modal = (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backdropFilter: "blur(3px)",
        background: visible ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0)",
        transition: "background 150ms ease",
      }}
    >
      <div
        className="relative w-full max-w-[46rem] max-h-[88vh] flex flex-col bg-white rounded-2xl border border-gray-200 font-sans overflow-hidden transition-all duration-150"
        style={{
          boxShadow: "0 24px 60px -12px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.97) translateY(8px)",
        }}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold text-white select-none"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
            >
              {initials(sender.name)}
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[13px] font-semibold text-gray-900 leading-none">
                  {sender.name}
                </span>
                {sender.email !== sender.name && (
                  <span className="text-[11px] text-gray-400 truncate">{sender.email}</span>
                )}
              </div>
              <h2 className="text-[15px] font-semibold text-gray-900 leading-snug mt-2">
                {subject}
              </h2>
              <p className="text-[11px] text-gray-400 mt-1">{dateStr}</p>
            </div>

            {/* Actions */}
            <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
              {gmailLink && (
                <a
                  href={gmailLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Open in Gmail"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </a>
              )}
              {onArchive && (
                <button
                  onClick={handleArchive}
                  disabled={archiving}
                  title="Archive"
                  aria-label="Archive email"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 active:scale-90 transition-all disabled:opacity-40"
                >
                  {archiving ? (
                    <span className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin inline-block" />
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                    </svg>
                  )}
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                title="Delete"
                aria-label="Delete email"
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all disabled:opacity-40"
              >
                {deleting ? (
                  <span className="w-3 h-3 rounded-full border-2 border-red-400 border-t-transparent animate-spin inline-block" />
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                )}
              </button>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="1" y1="1" x2="13" y2="13" />
                  <line x1="13" y1="1" x2="1" y2="13" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 scroll-smooth">

          {deleteError && (
            <div className="mb-4 flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {deleteError}
            </div>
          )}

          {state.status === "loading" && <SkeletonBody />}

          {state.status === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {state.message}
            </div>
          )}

          {state.status === "no-gmail" && (
            <div className="py-6">
              <p className="text-[12px] text-gray-400 mb-4 text-center">
                Manually added — no original Gmail message.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <p className="text-[13px] font-medium text-gray-900 leading-snug">{card.task}</p>
                <p className="text-[12px] text-gray-500 mt-1.5 leading-snug">{card.reason}</p>
              </div>
            </div>
          )}

          {state.status === "success" && (
            state.email.html
              ? <EmailIframe html={state.email.html} />
              : <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                  {state.email.body || <span className="italic text-gray-400">(empty body)</span>}
                </p>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonBody() {
  const widths = ["w-3/4", "w-full", "w-5/6", "w-2/3", "w-full", "w-4/5", "w-11/12", "w-3/5"];
  return (
    <div className="flex flex-col gap-2.5 animate-pulse">
      {widths.map((w, i) => (
        <div key={i} className={`h-2.5 bg-gray-100 rounded-full ${w}`} />
      ))}
      <div className="mt-3 flex flex-col gap-2.5">
        {["w-full", "w-5/6", "w-3/4"].map((w, i) => (
          <div key={i} className={`h-2.5 bg-gray-100 rounded-full ${w}`} />
        ))}
      </div>
    </div>
  );
}

function EmailIframe({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(320);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    let observer: ResizeObserver | null = null;

    function attach() {
      const body = iframe?.contentDocument?.body;
      if (!body) return;

      function measure() {
        if (body) setHeight(body.scrollHeight + 1);
      }

      measure();
      observer = new ResizeObserver(measure);
      observer.observe(body);
    }

    iframe.addEventListener("load", attach);
    return () => {
      iframe.removeEventListener("load", attach);
      observer?.disconnect();
    };
  }, []);

  return (
    <iframe
      ref={ref}
      srcDoc={html}
      sandbox="allow-same-origin"
      title="Email content"
      className="w-full border-0 block"
      style={{ height, overflow: "hidden" }}
    />
  );
}
