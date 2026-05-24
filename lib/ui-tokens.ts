import type { ColId } from "@/types";

/** Surface colors — Soft Canvas palette */
export const surfaces = {
  page: "bg-gray-50",
  card: "bg-white",
  cardBorder: "border-gray-200",
  cardBorderHover: "border-gray-300",
  inset:
    "bg-gray-100/80 border-gray-200",
  insetChip:
    "flex gap-1 items-start text-[11px] text-gray-500 bg-gray-100/80 border border-gray-200 rounded-md px-2",
  insetPanel: "mt-3 p-4 bg-gray-100/80 border border-gray-200 rounded-xl",
  actionTile: "bg-red-50 shadow-sm shadow-red-200/50",
  actionTileBorder: "border-red-200",
} as const;

/** Typography tokens — must match STANDARDS.md */
export const typography = {
  pageTitle: "text-lg font-semibold text-gray-900 tracking-tight",
  columnLabel: "text-[13px] font-semibold text-gray-700",
  body: "text-[13px] text-gray-800 leading-snug",
  bodyMuted: "text-[13px] text-gray-500 leading-snug",
  meta: "text-[11px] text-gray-400",
  subtitle: "text-[12px] text-gray-400",
  pill: "text-[11px] font-semibold px-2 py-0.5 rounded-full border",
  pillSmall: "text-[10px] px-1.5 py-0.5 rounded-full border font-semibold",
  sidebarLabel: "text-[9px] font-medium leading-none",
  senderName: "text-xs font-semibold text-gray-900",
  senderNameMuted: "text-xs font-semibold text-gray-600",
} as const;

/** Functional color presets — not tied to email categories */
export const functionalColors = {
  deadline:
    "text-[11px] px-2 py-0.5 rounded-full border border-yellow-200 bg-yellow-50 text-yellow-800",
  draftReply:
    "text-[11px] px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 transition-colors",
  replyPanel:
    "mt-2 text-xs text-gray-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-2 leading-relaxed",
  copyButton:
    "mt-1.5 block text-[11px] px-2 py-0.5 rounded-full border border-green-200 text-green-700 hover:bg-green-100 transition-colors",
  emailCount:
    "text-[11px] font-semibold px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-800",
  detailEmailCountDefault:
    "text-[11px] font-semibold px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600",
  overdueSubPill:
    "text-[11px] px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-700 font-medium",
  todaySubPill:
    "text-[11px] px-2 py-0.5 rounded-full border border-yellow-200 bg-yellow-50 text-yellow-800 font-medium",
  upcomingSubPill:
    "text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-gray-100 text-gray-600 font-medium",
  errorText: "text-xs text-red-500 mt-1",
} as const;

/** Action detail column headers — Overdue / Today / Upcoming */
export const actionGroupHeaders = [
  {
    id: "overdue",
    label: "Overdue",
    dot: "bg-red-500",
    pillBg: "bg-red-50",
    pillText: "text-red-800",
    pillBorder: "border-red-200",
  },
  {
    id: "today",
    label: "Today",
    dot: "bg-orange-400",
    pillBg: "bg-orange-50",
    pillText: "text-orange-800",
    pillBorder: "border-orange-200",
  },
  {
    id: "upcoming",
    label: "Upcoming",
    dot: "bg-gray-400",
    pillBg: "bg-gray-100",
    pillText: "text-gray-700",
    pillBorder: "border-gray-200",
  },
] as const;

/** Static hover classes derived from COL_CONFIG — Tailwind requires full class names */
export const hoverBorderByCol: Record<ColId, string> = {
  action: "hover:border-red-300",
  overdue: "hover:border-red-300",
  sub: "hover:border-gray-300",
  other: "hover:border-violet-300",
  invoice: "hover:border-amber-300",
};

export const groupHoverPillTextByCol: Record<ColId, string> = {
  action: "group-hover:text-red-800",
  overdue: "group-hover:text-red-800",
  sub: "group-hover:text-gray-700",
  other: "group-hover:text-violet-800",
  invoice: "group-hover:text-amber-800",
};

/** Drop zone active state — static full class strings per column */
export const dropZoneActiveByCol: Record<ColId, string> = {
  action: "border-orange-700 bg-orange-50",
  overdue: "border-red-700 bg-red-50",
  sub: "border-gray-400 bg-gray-50",
  other: "border-violet-700 bg-violet-50",
  invoice: "border-amber-500 bg-amber-50",
};

/** Card hover border — static full border class per column */
export const cardHoverBorderByCol: Record<ColId, string> = {
  action: "border-orange-300",
  overdue: "border-red-300",
  sub: "border-gray-300",
  other: "border-violet-300",
  invoice: "border-amber-300",
};

/** Sidebar nav button states */
export const sidebarNavButton = {
  active:
    "relative w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors bg-gray-100",
  inactive:
    "relative w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors bg-transparent hover:bg-gray-50",
} as const;

export const sidebarNavLabel = {
  active: "text-[9px] font-medium leading-none text-gray-900 font-semibold",
  inactive: "text-[9px] font-medium leading-none text-gray-400",
} as const;

/** Layout tokens */
export const layout = {
  mainContent: "flex-1 min-w-0 w-full px-10 py-8 max-w-6xl mx-auto",
  sidebar:
    "w-14 flex-shrink-0 flex flex-col items-center pt-2 gap-1 border-r bg-white border-gray-200",
  dashboardGrid: "grid grid-cols-2 gap-3.5 mt-2 items-stretch",
  actionDetailGrid: "grid grid-cols-3 gap-4",
  detailColumnGridTwo: "grid gap-4 grid-cols-2",
  detailColumnGridOne: "grid gap-4 grid-cols-1 max-w-md",
} as const;

/** Dashboard summary tile — fixed header heights for cross-tile alignment */
export const summaryTileLayout = {
  card: "group flex flex-col h-full w-full text-left cursor-pointer transition-colors relative",
  header: "h-16 mb-3 flex flex-col shrink-0",
  titleRow: "flex justify-between items-start gap-2 h-8",
  titleLabel: "flex items-start gap-1.5 min-w-0 flex-1",
  titleDot: "mt-0.5 shrink-0",
  titleText: typography.senderName + " line-clamp-2 leading-snug text-left",
  subtitle: typography.subtitle + " h-8 line-clamp-2 leading-snug shrink-0",
  footer: "flex justify-end mt-auto pt-3",
} as const;
