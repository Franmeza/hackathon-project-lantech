"use client";

import { useState } from "react";

interface PasteMessageProps {
  onExtracted: () => void;
}

export function PasteMessage({ onExtracted }: PasteMessageProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Classification failed");

      setText("");
      setOpen(false);
      onExtracted();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        ✦ Paste message
      </button>

      {open && (
        <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste any email, Slack message, or text here…"
            rows={4}
            className="w-full text-[13px] p-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 leading-relaxed"
          />
          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}
          <div className="flex gap-2 mt-2.5">
            <button
              onClick={handleExtract}
              disabled={loading || !text.trim()}
              className="text-[13px] font-medium px-4 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Extracting…" : "Extract actions"}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setText("");
                setError(null);
              }}
              className="text-[13px] px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
