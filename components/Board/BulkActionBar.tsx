"use client";

import { Button } from "@/components/ui/Button";
import { ReclassifyMenu } from "@/components/Board/ReclassifyMenu";

type BulkContext = "inbox" | "archive";

interface BulkActionBarProps {
  context: BulkContext;
  count: number;
  busy?: boolean;
  onCancel: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onReclassify: (col: import("@/types").ColId) => void;
  onDelete?: () => void;
}

export function BulkActionBar({
  context,
  count,
  busy = false,
  onCancel,
  onArchive,
  onRestore,
  onReclassify,
  onDelete,
}: BulkActionBarProps) {
  if (count <= 0) return null;

  return (
    <div className="sticky top-0 z-20 -mx-2 mb-4 px-2">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-2 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-gray-500 font-medium shrink-0">
          {count} selected
        </span>

        <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto sm:ml-auto">
          {context === "inbox" ? (
            <>
              <Button variant="secondary" onClick={onArchive} disabled={busy}>
                {busy ? "Archiving…" : "Archive"}
              </Button>
              {onDelete && (
                <Button variant="secondary" onClick={onDelete} disabled={busy}>
                  {busy ? "Deleting…" : "Delete"}
                </Button>
              )}
              <ReclassifyMenu disabled={busy} onSelect={onReclassify} />
            </>
          ) : (
            <Button variant="secondary" onClick={onRestore} disabled={busy}>
              {busy ? "Restoring…" : "Restore"}
            </Button>
          )}

          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

