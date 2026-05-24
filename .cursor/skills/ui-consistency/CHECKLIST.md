# UI Consistency Checklist

Use after running `node .cursor/skills/ui-consistency/scripts/validate-ui.mjs`.

## Typography

- [ ] Page titles use `typography.pageTitle`
- [ ] Column labels use `typography.columnLabel`
- [ ] Card body uses `typography.body` or `typography.bodyMuted`
- [ ] No custom `text-[Npx]` outside allowed scale (9, 10, 11, 12, 13, lg, xl, sm, xs)

## Colors

- [ ] Category dots, pills, borders come from `COL_CONFIG`
- [ ] Functional colors (deadline, reply, buttons) use `functionalColors` from `lib/ui-tokens.ts`
- [ ] No hardcoded orange/red/violet/amber for column semantics outside config

## Components

- [ ] Cards use `<Card>` from `components/ui/Card`
- [ ] Pills/badges use `<Pill>` from `components/ui/Pill`
- [ ] AI summary/reason blocks use `<AiChip>`
- [ ] Empty states use `<EmptyState>`
- [ ] Column headers use `<ColumnHeader>`
- [ ] Buttons use `<Button>` with correct variant

## Patterns

- [ ] No dynamic Tailwind template literals in `className`
- [ ] Hover states use static full class names (e.g. `hover:border-orange-300`)
- [ ] Transitions use `transition-colors` where existing components do
- [ ] Border radius: `rounded-xl` for cards/tiles, `rounded-lg` for buttons/panels, `rounded-full` for pills

## Layout

- [ ] Main content area: `flex-1 min-w-0 w-full px-10 py-8 max-w-6xl mx-auto`
- [ ] Sidebar: `w-14 flex-shrink-0 border-r border-gray-100`
- [ ] Dashboard grid: `grid grid-cols-2 gap-3.5`
- [ ] Action detail: `grid grid-cols-3 gap-4`

## Behavior preservation

- [ ] No changes to drag-and-drop handlers
- [ ] No changes to navigation flow
- [ ] No changes to product copy strings
- [ ] Final DOM classes match pre-refactor output (visual parity)
