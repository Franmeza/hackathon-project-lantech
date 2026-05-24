"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/utils";

interface RelativeTimeProps {
  date: string;
  className?: string;
}

function getRefreshIntervalMs(date: string): number {
  const diffMs = Date.now() - new Date(date).getTime();
  if (diffMs < 3_600_000) return 60_000;
  if (diffMs < 86_400_000) return 300_000;
  return 3_600_000;
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const [label, setLabel] = useState(() => formatRelativeTime(date));

  useEffect(() => {
    function refresh() {
      setLabel(formatRelativeTime(date));
    }

    refresh();
    const intervalMs = getRefreshIntervalMs(date);
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [date]);

  return <span className={className}>{label}</span>;
}
