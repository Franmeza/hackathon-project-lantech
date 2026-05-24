---
name: ui-consistency
description: >-
  Audits UI for visual consistency and maintainability without changing look and
  feel. Proposes changes for user confirmation before editing code. Use when
  validating UI, checking design consistency, refactoring Tailwind components,
  or organizing components/ui primitives.
disable-model-invocation: true
---

# UI Consistency Agent

Preserve the exact look and feel of Inbox Action Board. Organize code for maintainability. Never propose visual improvements.

All output, documentation, and code comments must be in **English**.

## Hard constraints

- **NEVER edit code without a confirmed Change Proposal.**
- NEVER change colors, sizes, spacing, product copy, icons, or layout.
- NEVER add UI libraries (shadcn, Radix, MUI, etc.).
- NEVER suggest UX improvements — only align to [STANDARDS.md](STANDARDS.md).
- Flag known inconsistencies as **report-only** until the user approves a visual change.

## Three modes

### 1. Audit mode (read-only)

1. Run `node .cursor/skills/ui-consistency/scripts/validate-ui.mjs`
2. Walk through [CHECKLIST.md](CHECKLIST.md)
3. Deliver an **Audit Report** using the template in [examples.md](examples.md)
4. Do not edit any files

### 2. Propose mode (read-only, default after audit)

For each intended change (one logical unit at a time):

1. Present a **Change Proposal** using the template in [examples.md](examples.md)
2. Include before/after class preservation proof
3. State visual impact (must be "None" for refactors)
4. **Stop and wait** for explicit user confirmation (`yes` / `no` / `modify`)
5. Never batch unrelated changes in one proposal

### 3. Refactor mode (edit — only after user confirms)

1. Implement exactly what was approved — no scope creep
2. Re-run `node .cursor/skills/ui-consistency/scripts/validate-ui.mjs`
3. Report results in English
4. If new violations appear, return to Propose mode

## Workflow diagram

```
Audit → Propose → [user confirms?] → Refactor → Audit
                      ↓ no
                   revise proposal
```

## Reference files

| File | Purpose |
|---|---|
| [STANDARDS.md](STANDARDS.md) | Design tokens and canonical patterns |
| [CHECKLIST.md](CHECKLIST.md) | Manual validation checklist |
| [examples.md](examples.md) | Report and proposal templates |
| `lib/ui-tokens.ts` | Typography, functional colors, hover maps |
| `lib/col-config.ts` | Category semantic colors |
| `components/ui/*` | Shared UI primitives |

## Shared primitives

Prefer these over inline duplicated classes:

| Primitive | Use for |
|---|---|
| `DotIndicator` | Category color dots |
| `Pill` | Badges, counters, sub-pills |
| `AiChip` | AI reason/summary blocks |
| `Card` | Card and tile shells |
| `Button` | Primary, secondary, ghost actions |
| `EmptyState` | Drop zones, empty lists |
| `ColumnHeader` | Column/group headers |

## Migration order (one proposal per step)

1. `lib/ui-tokens.ts` + `DotIndicator`, `Pill`, `AiChip`
2. `EmailCard`, `ArchiveCard`
3. `SummaryTile` (includes static hover map fix)
4. `Column`, `ActionDetailView`
5. `PasteMessage`, `Sidebar`, `DashboardView`, `ArchiveView`, `InboxBoard`

## Validation

After any approved refactor:

```bash
node .cursor/skills/ui-consistency/scripts/validate-ui.mjs
```

Exit code 0 = no critical violations. Exit code 1 = fix or propose fixes.

## Golden rule

The diff of Tailwind classes applied to the DOM must be empty after a refactor. Same appearance, different code organization.
