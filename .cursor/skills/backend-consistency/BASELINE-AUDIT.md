# Backend Baseline Audit

**Date:** 2026-05-24  
**Scope:** `app/api/`, `lib/`, `auth.ts`, `auth.config.ts`, `proxy.ts`, `app/page.tsx`

## Summary

| Check | Result |
|---|---|
| Critical violations | 0 |
| Warnings | 1 |
| `npm run validate:backend` | pass (exit 0) |
| `npm run typecheck` | pass (exit 0) |
| `npm run build` | pass (exit 0) |

## Validator warnings

| File | Line | Rule | Detail |
|---|---|---|---|
| `app/page.tsx` | 3 | `direct-prisma-in-page` | Prisma imported in page component — known debt |

## Critical violations

None.

## Contract status

All documented routes in [STANDARDS.md](STANDARDS.md) match current implementation:

- `/api/cards` — GET, POST, PATCH, DELETE
- `/api/cards/[id]/draft` — POST
- `/api/webhook/gmail` — POST (Pub/Sub idempotency)
- `/api/auth/[...nextauth]` — NextAuth handlers

## Maintainability debt (report-only)

1. **Duplicate serialization** — `serializeCard` in `app/api/cards/route.ts` vs inline map in `app/page.tsx` `getUserCards`
2. **Inconsistent auth helper** — `requireSession()` in cards route vs inline `auth()` in draft route
3. **Raw env in auth.config.ts** — NextAuth provider config uses `process.env` directly (whitelisted exception)
4. **No automated tests** — build is the integration gate

## Recommended first proposal

Extract `requireSession` to `lib/auth-session.ts` — API contract impact: None.
