"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { functionalColors } from "@/lib/ui-tokens";

interface PasteMessageProps {
  onExtracted: () => void;
  fullWidth?: boolean;
}

const STEPS = [
  "Reading message content",
  "Identifying sender & context",
  "Classifying category",
  "Generating action card",
];

export function PasteMessage({
  onExtracted,
  fullWidth = false,
}: PasteMessageProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const stepTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    stepTimers.current.forEach(clearTimeout);
    stepTimers.current = [];
  }

  function closePanel() {
    setOpen(false);
    setText("");
    setError(null);
    clearTimers();
    setLoading(false);
    setDone(false);
    setStepIndex(0);
  }

  async function handleExtract() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setDone(false);
    setStepIndex(0);

    STEPS.forEach((_, i) => {
      if (i === 0) return;
      const t = setTimeout(() => setStepIndex(i), i * 650);
      stepTimers.current.push(t);
    });

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Classification failed");

      clearTimers();
      setStepIndex(STEPS.length - 1);
      setDone(true);

      await new Promise((r) => setTimeout(r, 700));
      closePanel();
      onExtracted();
    } catch {
      clearTimers();
      setLoading(false);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={fullWidth ? "w-full" : undefined}>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-2.5 text-[13px] text-gray-400 bg-white border border-gray-200 hover:border-gray-300 hover:text-gray-600 rounded-xl px-4 py-2.5 transition-all group shadow-sm"
        >
          <span className="w-5 h-5 rounded-md bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors">
            <Icon name="clipboard-text" size="xs" className="text-gray-500" />
          </span>
          <span className="flex-1 text-left">Paste a message to classify…</span>
        </button>
      )}

      {open && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center">
                <Icon name="clipboard-text" size="xs" className="text-gray-600" />
              </span>
              <span className="text-[12px] font-semibold text-gray-700">
                Classify a message
              </span>
            </div>
            <button
              type="button"
              onClick={closePanel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>

          <div className="p-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste any email, Slack message, or text here…"
              rows={5}
              disabled={loading}
              className="w-full text-[13px] p-3 rounded-lg border border-gray-200 bg-white text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 leading-relaxed placeholder:text-gray-300 disabled:opacity-60 transition-all"
            />

            {error && <p className={functionalColors.errorText + " mt-2"}>{error}</p>}

            {loading && (
              <div className="mt-3 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  AI Processing
                </p>
                <div className="space-y-1.5">
                  {STEPS.map((step, i) => {
                    const isComplete = done ? i <= stepIndex : i < stepIndex;
                    const isCurrent = !done && i === stepIndex;
                    return (
                      <div key={step} className="flex items-center gap-2">
                        {isComplete ? (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            className="flex-shrink-0"
                          >
                            <circle cx="6" cy="6" r="6" fill="#10B981" />
                            <path
                              d="M3.5 6l2 2 3-3"
                              stroke="white"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : isCurrent ? (
                          <span className="w-3 h-3 rounded-full border-2 border-gray-900 border-t-transparent animate-spin flex-shrink-0 inline-block" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0 inline-block" />
                        )}
                        <span
                          className={`text-[11px] transition-colors ${
                            isComplete
                              ? "text-gray-600 line-through"
                              : isCurrent
                                ? "text-gray-900 font-medium"
                                : "text-gray-300"
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <Button
                variant="primary"
                onClick={handleExtract}
                disabled={loading || !text.trim()}
              >
                {loading ? "Processing…" : "Extract & classify"}
              </Button>
              {!loading && (
                <Button variant="ghost" onClick={closePanel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
