"use client";

import { Button } from "@/components/ui/Button";

interface BulkConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BulkConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirming = false,
  onConfirm,
  onCancel,
}: BulkConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-xl p-5">
        <p className="text-[13px] font-semibold text-gray-900 tracking-tight">
          {title}
        </p>
        <p className="text-[12px] text-gray-500 leading-relaxed mt-1.5">
          {description}
        </p>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onCancel} disabled={confirming}>
            {cancelText}
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={confirming}>
            {confirming ? "Working…" : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

