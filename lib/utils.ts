/**
 * Convert an RFC 2822 / ISO date string to a human-readable relative label.
 * e.g. "Just now", "2h ago", "Yesterday", "3 days ago"
 */
export function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "Recently";

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Recently";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 2) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}
