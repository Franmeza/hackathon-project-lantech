# Backend Consistency — Examples

## Audit report template

```markdown
# Backend Audit Report

**Date:** YYYY-MM-DD
**Scope:** app/api/, lib/, auth.ts, proxy.ts

## Summary
- Critical violations: 0
- Warnings: 2
- Maintainability debt: 3
- typecheck: pass | fail
- build: pass | fail

## Validator output
| File | Line | Rule | Severity | Detail |
|---|---|---|---|---|
| app/page.tsx | 3 | direct-prisma-in-page | warning | Prisma in page component |

## Contract inconsistencies
| Route | Issue |
|---|---|
| — | None |

## Maintainability debt
- Duplicate card serialization in app/page.tsx and app/api/cards/route.ts
- Inline auth() in draft route vs requireSession() in cards route

## Report-only (requires user approval to fix)
- Extract shared serializeCard to lib/cards.ts

## Verification
- `npm run validate:backend`: exit 0
- `npm run typecheck`: exit 0
- `npm run build`: exit 0

## Recommended next proposal
Extract `requireSession` to `lib/auth-session.ts` — API contract impact: None.
```

## Change proposal template

```markdown
## Change Proposal: Extract requireSession helper

**Intent:** maintainability
**API contract impact:** None — same status codes and JSON shapes

### Files to create
- lib/auth-session.ts — shared `requireSession()` returning session or null

### Files to modify
- app/api/cards/route.ts — import requireSession, remove local copy
- app/api/cards/[id]/draft/route.ts — use requireSession instead of inline auth block

### Contract preservation proof
| Endpoint | Before | After |
|---|---|---|
| GET /api/cards | 401 `{ error: "Unauthorized" }` | unchanged |
| POST /api/cards/[id]/draft | 401 / 404 shapes | unchanged |

### Risk
Low — internal refactor only

**Proceed with this change?** (yes / no / modify)
```

## Invocation examples

```
Use the backend-consistency skill in audit mode
```

```
Use backend-consistency to propose extracting serializeCard without changing API responses
```

```
Run validate-backend.mjs and npm run build, then report backend inconsistencies
```
