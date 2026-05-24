"use client";

import { useEffect, useRef, useState } from "react";
import type { ColId } from "@/types";
import { COL_CONFIG } from "@/lib/col-config";
import { Button } from "@/components/ui/Button";

interface ReclassifyMenuProps {
  disabled?: boolean;
  onSelect: (col: ColId) => void;
}

const COL_ORDER: ColId[] = ["action", "overdue", "invoice", "sub", "other"];

export function ReclassifyMenu({ disabled = false, onSelect }: ReclassifyMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="secondary"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        Reclassify
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
          {COL_ORDER.map((col) => {
            const cfg = COL_CONFIG[col];
            return (
              <button
                key={col}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSelect(col);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50"
              >
                <span className={"w-2 h-2 rounded-full " + cfg.dot} />
                <span className="font-medium">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

