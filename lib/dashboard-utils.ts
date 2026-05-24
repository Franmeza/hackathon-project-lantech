import type { Card } from "@/types";

export type ActionUrgency = "overdue" | "today" | "upcoming";

export function isTodayDeadline(deadline: string): boolean {
  const d = deadline.toLowerCase();
  return d.includes("today") || d.includes("eod");
}

export function getActionUrgency(card: Card): ActionUrgency {
  if (card.col === "overdue") return "overdue";
  if (card.deadline !== null && isTodayDeadline(card.deadline)) return "today";
  return "upcoming";
}

const URGENCY_ORDER: Record<ActionUrgency, number> = {
  overdue: 0,
  today: 1,
  upcoming: 2,
};

export function sortByUrgency(cards: Card[]): Card[] {
  return [...cards].sort(
    (a, b) => URGENCY_ORDER[getActionUrgency(a)] - URGENCY_ORDER[getActionUrgency(b)]
  );
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function countActionGroups(cards: Card[]) {
  return {
    overdue: cards.filter((c) => c.col === "overdue").length,
    today: cards.filter(
      (c) =>
        c.col === "action" && c.deadline !== null && isTodayDeadline(c.deadline)
    ).length,
    upcoming: cards.filter(
      (c) =>
        c.col === "action" &&
        (c.deadline === null || !isTodayDeadline(c.deadline))
    ).length,
  };
}

export function urgencyLabel(urgency: ActionUrgency): string {
  if (urgency === "overdue") return "Overdue";
  if (urgency === "today") return "Today";
  return "Upcoming";
}
