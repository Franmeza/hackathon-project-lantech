import type { ColId } from "@/types";

/** Surface colors — Soft Canvas palette */
export const surfaces = {
  page: "bg-gray-100",
  sidebar: "bg-zinc-800",
  sidebarBorder: "border-zinc-700",
  card: "bg-white",
  cardBorder: "border-gray-200",
  cardBorderHover: "border-gray-300",
  inset:
    "bg-gray-100/80 border-gray-200",
  insetChip:
    "flex gap-1 items-start text-[11px] text-gray-500 bg-gray-100/80 border border-gray-200 rounded-md px-2",
  insetPanel: "mt-3 p-4 bg-gray-100/80 border border-gray-200 rounded-xl",
  actionTile: "bg-white",
  actionTileBorder: "border-2 border-red-400",
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
  sidebarLabel: "text-[13px] font-medium leading-none",
  senderName: "text-xs font-semibold text-gray-900",
  senderNameMuted: "text-xs font-semibold text-gray-600",
} as const;

/** Tabler icon sizes — use via components/ui/Icon only */
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 18,
  lg: 20,
  brandLogo: 28,
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
    "text-[11px] px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 font-medium",
  upcomingSubPill:
    "text-[11px] px-2 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-700 font-medium",
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
    dot: "bg-amber-500",
    pillBg: "bg-amber-50",
    pillText: "text-amber-800",
    pillBorder: "border-amber-200",
  },
  {
    id: "upcoming",
    label: "Upcoming",
    dot: "bg-green-500",
    pillBg: "bg-green-50",
    pillText: "text-green-800",
    pillBorder: "border-green-200",
  },
] as const;

/** Static hover classes derived from COL_CONFIG — Tailwind requires full class names */
export const hoverBorderByCol: Record<ColId, string> = {
  action: "hover:border-red-300",
  overdue: "hover:border-red-300",
  sub: "hover:border-green-300",
  other: "hover:border-violet-300",
  invoice: "hover:border-amber-300",
};

export const groupHoverPillTextByCol: Record<ColId, string> = {
  action: "group-hover:text-red-800",
  overdue: "group-hover:text-red-800",
  sub: "group-hover:text-green-800",
  other: "group-hover:text-violet-800",
  invoice: "group-hover:text-amber-800",
};

/** Drop zone active state — static full class strings per column */
export const dropZoneActiveByCol: Record<ColId, string> = {
  action: "border-orange-700 bg-orange-50",
  overdue: "border-red-700 bg-red-50",
  sub: "border-green-600 bg-green-50",
  other: "border-violet-700 bg-violet-50",
  invoice: "border-amber-500 bg-amber-50",
};

/** Card hover border — static full border class per column */
export const cardHoverBorderByCol: Record<ColId, string> = {
  action: "border-orange-300",
  overdue: "border-red-300",
  sub: "border-green-300",
  other: "border-violet-300",
  invoice: "border-amber-300",
};

/** Sidebar layout — expanded (icon + label row) and collapsed (icons only) */
export const sidebarLayout = {
  shell:
    "flex-shrink-0 flex flex-col border-r bg-zinc-800 border-zinc-700 transition-[width] duration-200 ease-in-out min-h-screen",
  expandedWidth: "w-44",
  collapsedWidth: "w-14",
  brand:
    "w-full flex items-center justify-center gap-2 px-2 py-3 transition-colors hover:opacity-90",
  brandExpanded: "flex-row",
  brandCollapsed: "flex-row",
  brandLogoWrap:
    "h-8 w-8 flex items-center justify-center shrink-0",
  brandIcon: "text-zinc-100",
  brandLogo: "h-7 w-7 object-contain",
  brandLabel:
    "text-[13px] font-semibold text-zinc-100 truncate leading-none text-center",
  navList: "flex flex-col gap-1 px-2 pt-1 w-full",
  navButtonBase:
    "relative rounded-xl flex items-center transition-colors",
  navButtonExpanded:
    "w-full h-9 flex-row gap-2.5 px-2.5 justify-start",
  navButtonCollapsed:
    "w-9 h-9 justify-center mx-auto",
  navButtonActive: "bg-zinc-700",
  navButtonInactive: "bg-transparent hover:bg-zinc-700/70",
  navLabel: "text-[13px] font-medium leading-none truncate",
  navLabelActive: "text-zinc-100 font-semibold",
  navLabelInactive: "text-zinc-400",
  navIconActive: "text-zinc-100",
  navIconInactive: "text-zinc-400",
  toggleButton:
    "h-8 w-8 rounded-md border border-zinc-600 bg-zinc-700 flex items-center justify-center text-zinc-300 hover:text-zinc-100 hover:bg-zinc-600 transition-colors",
  controlWrapper: "relative shrink-0",
  controlMenu:
    "absolute bottom-full right-0 mb-2 w-44 rounded-lg border border-zinc-600 bg-zinc-800 shadow-lg shadow-black/30 py-1 z-50",
  controlMenuTitle:
    "px-3 py-2 text-[11px] font-medium text-zinc-500 border-b border-zinc-700",
  controlMenuItem:
    "w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-zinc-200 hover:bg-zinc-700 transition-colors text-left",
  controlMenuDot: "w-1.5 h-1.5 rounded-full bg-zinc-100 shrink-0",
  controlMenuDotPlaceholder: "w-1.5 h-1.5 shrink-0",
  bottomBar:
    "mt-auto px-2 pt-2 pb-3 flex items-center justify-between gap-2 border-t border-zinc-700 w-full",
  bottomBarCollapsed: "flex-col items-center",
  profileButton:
    "h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center hover:bg-zinc-600 transition-colors shrink-0",
  profileAvatar: "text-[11px] font-semibold text-zinc-200 leading-none select-none",
  profileMenu:
    "absolute bottom-full left-0 mb-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg shadow-gray-200/60 py-1 z-50",
  profileMenuHeader: "px-3 py-2.5 border-b border-gray-100",
  profileMenuName: "text-[13px] font-semibold text-gray-900 truncate",
  profileMenuEmail: "text-[12px] text-gray-500 truncate mt-0.5",
  profileMenuItem:
    "w-full px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left",
} as const;

/** @deprecated Use sidebarLayout — kept for validator compatibility */
export const sidebarNavButton = {
  active:
    "relative w-full h-9 rounded-xl flex flex-row items-center gap-2.5 px-2.5 transition-colors bg-gray-100",
  inactive:
    "relative w-full h-9 rounded-xl flex flex-row items-center gap-2.5 px-2.5 transition-colors bg-transparent hover:bg-gray-50",
} as const;

/** @deprecated Use sidebarLayout */
export const sidebarNavLabel = {
  active: "text-[13px] font-medium leading-none text-gray-900 font-semibold",
  inactive: "text-[13px] font-medium leading-none text-gray-500",
} as const;

/** Per-tile dashboard identity — icon, badge, dots, links */
export const tileIdentity = {
  action: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    link: "text-red-600 group-hover:text-red-700",
    hoverBorder: "hover:border-red-400",
  },
  invoice: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    link: "text-amber-600 group-hover:text-amber-700",
    hoverBorder: "hover:border-amber-300",
  },
  other: {
    iconBg: "bg-violet-100",
    iconColor: "text-violet-700",
    link: "text-violet-700 group-hover:text-violet-800",
    hoverBorder: "hover:border-violet-300",
  },
  sub: {
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
    link: "text-green-700 group-hover:text-green-800",
    hoverBorder: "hover:border-green-300",
  },
} as const;

/** Action urgency styling for hero previews */
export const actionUrgencyStyle = {
  overdue: {
    avatar: "bg-red-100 text-red-700",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
    badgeBorder: "border-red-200",
    time: "text-red-600",
    statBox: "bg-red-50 border border-red-200",
    statNumber: "text-red-700",
  },
  today: {
    avatar: "bg-amber-100 text-amber-800",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-200",
    time: "text-gray-600",
    statBox: "bg-white border border-gray-200",
    statNumber: "text-gray-900",
  },
  upcoming: {
    avatar: "bg-green-100 text-green-800",
    badgeBg: "bg-green-50",
    badgeText: "text-green-800",
    badgeBorder: "border-green-200",
    time: "text-gray-600",
    statBox: "bg-white border border-gray-200",
    statNumber: "text-gray-900",
  },
} as const;

/** Layout tokens */
export const layout = {
  mainContent: "flex-1 min-w-0 w-full px-10 py-8 max-w-6xl mx-auto",
  sidebar: sidebarLayout.shell,
  dashboardSecondaryGrid: "grid grid-cols-3 gap-3 items-stretch",
  actionDetailGrid: "grid grid-cols-3 gap-4",
  detailColumnGridTwo: "grid gap-4 grid-cols-2",
  detailColumnGridOne: "grid gap-4 grid-cols-1 max-w-md",
} as const;

/** Dashboard tile layout */
export const dashboardTileLayout = {
  heroCard:
    "group w-full text-left cursor-pointer transition-colors rounded-xl border-2 border-red-400 bg-white p-4 font-sans hover:border-red-500",
  heroHeader: "flex items-start justify-between gap-4 mb-3",
  heroTitleBlock: "flex items-start gap-2.5 min-w-0",
  heroIcon:
    "w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-base shrink-0",
  heroTitle: "text-sm font-semibold text-gray-900 leading-tight",
  heroSubtitle: typography.subtitle,
  statGrid: "flex gap-2 shrink-0",
  statBox: "flex flex-col items-center justify-center rounded-lg px-3 py-1.5 min-w-[68px]",
  statNumber: "text-lg font-semibold leading-none",
  statLabel: "text-[10px] text-gray-500 mt-0.5",
  previewList: "flex flex-col gap-1.5",
  previewRow:
    "flex items-center gap-2.5 rounded-lg bg-gray-50 px-2.5 py-2",
  previewAvatar:
    "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0",
  previewContent: "flex-1 min-w-0",
  previewSender: "text-xs font-semibold text-gray-900 truncate",
  previewTask: "text-[11px] text-gray-500 truncate",
  previewMeta: "flex items-center gap-2 shrink-0",
  previewTime: "text-[11px] whitespace-nowrap",
  categoryCard:
    "group flex flex-col h-full w-full text-left cursor-pointer transition-colors rounded-xl border bg-white p-4 font-sans",
  categoryHeader: "mb-2.5",
  categoryTitleRow: "flex items-center justify-between gap-2",
  categoryTitleBlock: "flex items-center gap-2 min-w-0",
  categoryIcon:
    "w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0",
  categoryTitle: "text-xs font-semibold text-gray-900 truncate",
  categorySubtitle: typography.subtitle + " mt-0.5",
  categoryPreviewList: "flex flex-col gap-1.5 flex-1",
  categoryPreviewRow:
    "flex items-start gap-2 rounded-lg bg-gray-50 px-2.5 py-2",
  categoryPreviewDot: "mt-1 shrink-0",
  categoryPreviewSender: "text-xs font-semibold text-gray-900 truncate",
  categoryPreviewTask: "text-[11px] text-gray-500 truncate",
  categoryFooter: "flex justify-end mt-3 pt-1",
  categoryLink: "text-[11px] font-medium transition-colors",
  heroFooter: "flex justify-end mt-3 pt-1",
  heroLink: "text-[11px] font-medium text-red-600 group-hover:text-red-700 transition-colors",
} as const;

/** @deprecated Use dashboardTileLayout */
export const summaryTileLayout = {
  card: dashboardTileLayout.categoryCard,
  header: dashboardTileLayout.categoryHeader,
  titleRow: dashboardTileLayout.categoryTitleRow,
  titleLabel: dashboardTileLayout.categoryTitleBlock,
  titleDot: dashboardTileLayout.categoryPreviewDot,
  titleText: dashboardTileLayout.categoryTitle,
  subtitle: dashboardTileLayout.categorySubtitle,
  footer: dashboardTileLayout.categoryFooter,
} as const;

/** Sign-in page — marketing panel + login card */
export const signIn = {
  shell: "min-h-screen flex flex-col lg:flex-row",
  heroShell:
    "w-full lg:w-2/3 flex flex-col justify-between relative overflow-hidden p-6 sm:p-8 lg:p-12 shrink-0 min-h-[52vh] lg:min-h-screen",
  heroPanel: "bg-[#0B0C0E]",
  heroGrid: "sign-in-hero-grid absolute inset-0 pointer-events-none",
  heroGlow:
    "absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none",
  heroBrandWrap: "relative flex items-center gap-2.5 z-[1]",
  heroBrandName: "text-white font-semibold text-[15px] tracking-tight",
  heroBrandTagline: "text-[11px] text-white/40 font-medium -mt-0.5",
  heroBrandText: "flex flex-col min-w-0",
  heroContent: "relative z-[1] mt-8 lg:mt-0",
  heroBadge:
    "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/10 text-white/50 text-xs font-medium mb-5 lg:mb-8",
  heroBadgeDot: "w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block",
  heroTitle:
    "text-[28px] sm:text-[36px] lg:text-[46px] font-bold text-white leading-[1.07] tracking-tight mb-4 lg:mb-6",
  heroGradientText:
    "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent",
  heroDescription:
    "text-[14px] sm:text-[15px] text-white/45 leading-relaxed max-w-md mb-6 lg:mb-10",
  heroFeatureGrid: "grid grid-cols-1 sm:grid-cols-2 gap-3",
  heroFeatureCard:
    "flex gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.07]",
  heroFeatureIcon: "text-white/70 shrink-0 mt-0.5",
  heroFeatureTitle: "text-[13px] font-medium text-white/80 leading-tight",
  heroFeatureDesc: "text-[12px] text-white/35 mt-0.5 leading-snug",
  heroFooter: "relative text-[11px] text-white/20 z-[1] mt-6 lg:mt-0",
  loginShell: "w-full lg:w-1/3 flex flex-col items-center justify-center flex-1",
  loginPanel: "flex flex-col items-center justify-center px-6 sm:px-8 py-8 lg:py-12 w-full",
  loginCard: "bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden",
  loginCardBody: "px-8 pt-8 pb-6",
  loginCardTitle: "text-[22px] font-bold text-gray-900 tracking-tight mb-1",
  loginCardSubtitle: "text-[13px] text-gray-500 leading-relaxed mb-7",
  loginTrustFooter: "border-t border-gray-100 px-8 py-4 bg-gray-50/60",
  loginTrustGrid: "flex items-center justify-between",
  loginTrustItem: "flex flex-col items-center gap-1",
  loginTrustLabel: "text-[10px] text-gray-400 font-medium",
  loginLegal: "text-center text-[11px] text-gray-400 mt-5 leading-relaxed",
  googleButton:
    "w-full flex items-center justify-center gap-3 text-[13px] font-semibold px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
} as const;
