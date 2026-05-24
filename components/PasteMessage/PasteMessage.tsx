"use client";

import { useState, useRef } from "react";

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

  async function handleExtract() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setDone(false);
    setStepIndex(0);

    // Advance step indicator every ~600ms
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
      setText("");
      setOpen(false);
      setDone(false);
      setStepIndex(0);
      onExtracted();
    } catch {
      clearTimers();
      setLoading(false);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const buttonBase =
    "flex items-center gap-2 text-[12px] font-semibold px-3.5 py-1.5 rounded-lg transition-all";

  return (
    <div className={fullWidth ? "w-full" : undefined}>
      {/* Trigger row */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-2.5 text-[13px] text-gray-400 bg-white border border-gray-200 hover:border-gray-300 hover:text-gray-600 rounded-xl px-4 py-2.5 transition-all group shadow-sm"
        >
          <span className="w-5 h-5 rounded-md bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors text-[11px]">
            ✦
          </span>
          <span className="flex-1 text-left">Paste a message to classify…</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-gray-300 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 font-mono">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Expanded panel */}
      {open && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-[11px]">
                ✦
              </span>
              <span className="text-[12px] font-semibold text-gray-700">
                Classify a message
              </span>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                setText("");
                setError(null);
                clearTimers();
                setLoading(false);
                setDone(false);
                setStepIndex(0);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13"/>
              </svg>
            </button>
          </div>

          {/* Textarea */}
          <div className="p-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste any email, Slack message, or text here…"
              rows={5}
              disabled={loading}
              className="w-full text-[13px] p-3 rounded-lg border border-gray-200 bg-white text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 leading-relaxed placeholder:text-gray-300 disabled:opacity-60 transition-all"
            />

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0a6 6 0 100 12A6 6 0 006 0zm0 9a.75.75 0 110-1.5A.75.75 0 016 9zm.75-3.75a.75.75 0 01-1.5 0v-2a.75.75 0 011.5 0v2z"/></svg>
                {error}
              </div>
            )}

            {/* AI processing steps */}
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

            {/* Action buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleExtract}
                disabled={loading || !text.trim()}
                className={`${buttonBase} bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm`}
              >
                {loading ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                    Processing…
                  </>
                ) : (
                  <>
                    <span className="text-[11px]">✦</span>
                    Extract &amp; classify
                  </>
                )}
              </button>
              {!loading && (
                <button
                  onClick={() => {
                    setOpen(false);
                    setText("");
                    setError(null);
                  }}
                  className={`${buttonBase} border border-gray-200 text-gray-500 hover:bg-gray-50`}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
