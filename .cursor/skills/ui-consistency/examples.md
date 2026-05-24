# UI Consistency — Examples

## Audit report template

```markdown
# UI Audit Report

**Date:** 2026-05-23
**Scope:** components/, app/

## Summary
- Critical violations: 2
- Inconsistencies: 4
- Maintainability debt: 6

## Critical violations
| File | Line | Rule | Detail |
|---|---|---|---|
| components/Dashboard/SummaryTile.tsx | 64 | dynamic-tailwind | `hover:${primaryColConfig.border}` will not compile |

## Inconsistencies
| Pattern | Files | Issue |
|---|---|---|
| AI chip | EmailCard, SummaryTile | Duplicate class string — extract to AiChip |

## Maintainability debt
- EmailCard, ArchiveCard, SummaryTile all duplicate card shell classes

## Report-only (requires user approval to fix)
- TILE_DEFINITIONS.sub uses blue-500 but COL_CONFIG.sub uses gray

## Recommended next proposal
Extract `DotIndicator`, `Pill`, `AiChip` to `components/ui/` — no visual change.
```

## Change proposal template

```markdown
## Change Proposal: Extract AiChip primitive

**Intent:** maintainability
**Visual impact:** None — same Tailwind classes applied to DOM

### Files to create
- components/ui/AiChip.tsx — shared AI summary/reason chip

### Files to modify
- components/Card/EmailCard.tsx — replace inline chip div with `<AiChip>`
- components/Dashboard/SummaryTile.tsx — replace inline chip div with `<AiChip compact={false}>`

### Before → After (class preservation proof)
| Element | Current classes | After refactor classes |
|---|---|---|
| EmailCard reason | `flex gap-1 items-start text-[11px] text-gray-500 bg-gray-50 border border-gray-100 rounded-md px-2 py-1 mb-2` | identical via `<AiChip className="mb-2">` |
| SummaryTile summary | `... px-2 py-1.5 mt-3 mb-3` | identical via `<AiChip className="mt-3 mb-3" padding="relaxed">` |

### Risk
- None

**Proceed with this change?** (yes / no / modify)
```

## Example agent response after user confirms

```markdown
Implemented Change Proposal: Extract AiChip primitive.

- Created components/ui/AiChip.tsx
- Updated EmailCard.tsx, SummaryTile.tsx
- validate-ui.mjs: 1 critical violation remaining (dynamic-tailwind in SummaryTile hover)

Next recommended proposal: Fix SummaryTile dynamic hover classes via static map in ui-tokens.ts.
```

## Invocation examples

```
Use the ui-consistency skill in audit mode
```

```
Use ui-consistency to propose refactoring EmailCard without changing appearance
```

```
Run validate-ui.mjs and report inconsistencies
```
