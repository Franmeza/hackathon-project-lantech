"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { functionalColors, surfaces } from "@/lib/ui-tokens";

interface PasteMessageProps {
  onExtracted: () => void;
  fullWidth?: boolean;
}

export function PasteMessage({ onExtracted, fullWidth = false }: PasteMessageProps) {
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
    <div className={fullWidth ? "w-full" : undefined}>
      <div className={fullWidth ? "flex justify-end" : undefined}>
        <Button variant="secondary" onClick={() => setOpen((v) => !v)}>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clipboard-text" size="sm" />
            Paste message
          </span>
        </Button>
      </div>

      {open && (
        <div className={surfaces.insetPanel}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste any email, Slack message, or text here…"
            rows={4}
            className="w-full text-[13px] p-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 leading-relaxed"
          />
          {error && <p className={functionalColors.errorText}>{error}</p>}
          <div className="flex gap-2 mt-2.5">
            <Button
              variant="primary"
              onClick={handleExtract}
              disabled={loading || !text.trim()}
            >
              {loading ? "Extracting…" : "Extract actions"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setText("");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
