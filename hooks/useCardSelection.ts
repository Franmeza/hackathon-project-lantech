"use client";

import { useMemo, useState } from "react";

export function useCardSelection() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const selectedCount = selected.size;

  function enterMode() {
    setSelectionMode(true);
  }

  function exitMode() {
    setSelectionMode(false);
    setSelected(new Set());
  }

  function clear() {
    setSelected(new Set());
  }

  function isSelected(id: string): boolean {
    return selected.has(id);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll(ids: string[]) {
    setSelected(new Set(ids));
  }

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  return {
    selectionMode,
    selectedIds,
    selectedCount,
    enterMode,
    exitMode,
    clear,
    toggle,
    selectAll,
    isSelected,
  };
}

