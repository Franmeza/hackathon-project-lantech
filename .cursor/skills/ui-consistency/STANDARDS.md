# UI Standards — Inbox Action Board

Source of truth extracted from the existing codebase. Do not invent new values.

## Typography

Font: **DM Sans** (400/500/600), `antialiased` — configured in `app/layout.tsx`.

| Token | Tailwind classes | Usage |
|---|---|---|
| `pageTitle` | `text-lg font-semibold text-gray-900 tracking-tight` | View titles |
| `columnLabel` | `text-[13px] font-semibold text-gray-700` | Column headers |
| `body` | `text-[13px] text-gray-800 leading-snug` | Card body text |
| `bodyMuted` | `text-[13px] text-gray-500 leading-snug` | Archived card body |
| `meta` | `text-[11px] text-gray-400` | Timestamps, footer |
| `subtitle` | `text-[12px] text-gray-400` | Tile subtitles |
| `pill` | `text-[11px] font-semibold px-2 py-0.5 rounded-full border` | Badges / counters |
| `pillSmall` | `text-[10px] px-1.5 py-0.5 rounded-full border font-semibold` | Small category pills |
| `sidebarLabel` | `text-[9px] font-medium leading-none` | Sidebar nav labels |
| `button` | `text-[13px] font-medium` | Button labels |
| `buttonSmall` | `text-[10px] font-medium` | Inline action buttons |

Allowed custom font sizes: `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-[12px]`, `text-[13px]`, plus `text-lg`, `text-xl`, `text-sm`, `text-xs`.

## Surface colors — Soft Canvas palette

Use via `surfaces` in `lib/ui-tokens.ts`:

| Token | Tailwind classes | Usage |
|---|---|---|
| `page` | `bg-gray-50` | App background (`app/page.tsx`) |
| `card` | `bg-white` | Cards and tiles (`components/ui/Card`) |
| `cardBorder` | `border-gray-200` | Default card border |
| `cardBorderHover` | `border-gray-300` | Neutral hover border |
| `inset` | `bg-gray-100/80 border-gray-200` | Recessed areas |
| `insetChip` | `bg-gray-100/80 border-gray-200` + chip layout | AI summary/reason (`AiChip`) |
| `insetPanel` | `bg-gray-100/80 border-gray-200 rounded-xl` | Paste message panel |
| `actionTile` | `bg-red-50 shadow-sm shadow-red-200/50` | Action Required dashboard tile |
| `actionTileBorder` | `border-red-200` | Action Required tile border |

Sidebar surface: `bg-white border-gray-200` (via `layout.sidebar`).

## Semantic colors — email categories

Use exclusively via `lib/col-config.ts` (`COL_CONFIG`):

- `dot`, `pillBg`, `pillText`, `pillBorder`, `border`, `bg`, `accent`

Never hardcode category colors (orange, red, violet, amber, gray for columns) outside `COL_CONFIG` or `lib/ui-tokens.ts` maps derived from it.

## Functional colors (ad-hoc, do not change)

| Purpose | Classes |
|---|---|
| Deadline badge | `border-yellow-200 bg-yellow-50 text-yellow-800` |
| Today sub-pill | `border-yellow-200 bg-yellow-50 text-yellow-800 font-medium` |
| Overdue sub-pill | `border-red-200 bg-red-50 text-red-700 font-medium` |
| Upcoming sub-pill | `border-gray-200 bg-gray-100 text-gray-600 font-medium` |
| Draft reply button | `border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100` |
| Reply panel | `bg-green-50 border-green-200 text-green-700 rounded-lg` |
| Copy button | `border-green-200 text-green-700 hover:bg-green-100` |
| Primary button | `bg-gray-900 text-white hover:bg-gray-700` |
| Secondary button | `border border-gray-200 bg-white text-gray-700 hover:bg-gray-50` |
| Ghost button | `border border-gray-200 text-gray-500 hover:bg-gray-100` |
| AI chip | `text-[11px] text-gray-500 bg-gray-100/80 border border-gray-200 rounded-md` (`surfaces.insetChip`) |
| Error text | `text-xs text-red-500 mt-1` (`functionalColors.errorText`) |
| Email count badge | `border-red-200 bg-red-50 text-red-800` |

## Canonical component patterns

| Pattern | Base classes | Reference |
|---|---|---|
| Card (default) | `bg-white rounded-xl border border-gray-200 p-3 mb-2 font-sans` | `EmailCard` |
| Card (archived) | `bg-white border border-gray-200 rounded-xl p-3 mb-2 opacity-85 font-sans` | `ArchiveCard` |
| Tile | `bg-white rounded-xl p-4 border border-gray-200` | `SummaryTile` |
| Dot | `w-2 h-2 rounded-full flex-shrink-0 inline-block` | All headers |
| Empty state | `text-center py-8 text-xs text-gray-300 border border-dashed border-gray-200 rounded-xl` | `Column` |
| Empty state (large) | `text-center py-16 text-sm text-gray-300 border border-dashed border-gray-200 rounded-2xl` | `ArchiveView` |
| Column header | `flex items-center gap-2 mb-2.5 pb-2.5 border-b border-gray-100` | `Column` |
| Layout shell | Page `bg-gray-50` + sidebar `bg-white border-gray-200` + main `flex-1 w-full px-10 py-8 max-w-6xl mx-auto` | `InboxBoard` |
| Drop zone (active) | `min-h-44 rounded-xl p-0.5 border-2 border-dashed` + col `accent` + `bg` | `Column` |

## Shared primitives

Prefer `components/ui/*` over duplicating class strings:

- `DotIndicator`, `Pill`, `AiChip`, `Card`, `Button`, `EmptyState`, `ColumnHeader`

Import tokens from `lib/ui-tokens.ts` for typography and functional color presets.

## Forbidden anti-patterns

1. **Dynamic Tailwind in className** — e.g. `` `hover:${cfg.border}` `` (Tailwind cannot compile these). Use static maps in `lib/ui-tokens.ts`.
2. **Duplicated class strings** when a primitive exists in `components/ui/`.
3. **Category colors outside `COL_CONFIG`** — report only; require user approval before changing.
4. **Visual improvements** (dark mode, responsive redesign, extra a11y) — out of scope for this agent.

## Known inconsistencies

None at this time. `TILE_DEFINITIONS` accent colors are aligned with `COL_CONFIG` primary column semantics.
