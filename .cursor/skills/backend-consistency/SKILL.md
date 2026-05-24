---
name: backend-consistency
description: >-
  Audits backend/API consistency and verifies the project still typechecks and
  builds after changes. Proposes changes for user confirmation before editing
  code. Use when validating API routes, lib services, auth patterns, Prisma
  access, or refactoring server code without breaking HTTP contracts.
disable-model-invocation: true
---

# Backend Consistency Agent

Preserve HTTP contracts and auth boundaries for Smart Inbox. Organize server code for maintainability. Never change API responses without approval.

All output, documentation, and code comments must be in **English**.

## Hard constraints

- **NEVER edit code without a confirmed Change Proposal.**
- NEVER change status codes, JSON field names, or response shapes without approval.
- NEVER add public routes in `proxy.ts` without approval.
- Protected API routes must call `auth()` and scope Prisma queries by `session.user.id`.
- Errors must use `{ error: string }`.
- Webhook `/api/webhook/gmail` follows Pub/Sub idempotency rules in [STANDARDS.md](STANDARDS.md).
- Flag known debt as **report-only** until the user approves a refactor.

## Three modes

### 1. Audit mode (read-only)

1. Run `npm run validate:backend`
2. Run `npm run typecheck`
3. Run `npm run build`
4. Walk through [CHECKLIST.md](CHECKLIST.md)
5. Deliver a **Backend Audit Report** using the template in [examples.md](examples.md)
6. Do not edit any files

### 2. Propose mode (read-only, default after audit)

For each intended change (one logical unit at a time):

1. Present a **Change Proposal** using the template in [examples.md](examples.md)
2. Include contract preservation proof (status + body before/after)
3. State API contract impact (must be "None" for refactors)
4. **Stop and wait** for explicit user confirmation (`yes` / `no` / `modify`)
5. Never batch unrelated changes in one proposal

### 3. Refactor mode (edit — only after user confirms)

1. Implement exactly what was approved — no scope creep
2. Re-run the full verification pipeline:
   ```bash
   npm run validate:backend
   npm run typecheck
   npm run build
   ```
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
| [STANDARDS.md](STANDARDS.md) | API contracts, auth, env, anti-patterns |
| [CHECKLIST.md](CHECKLIST.md) | Manual validation checklist |
| [examples.md](examples.md) | Report and proposal templates |
| [BASELINE-AUDIT.md](BASELINE-AUDIT.md) | Initial audit snapshot |
| `app/api/cards/route.ts` | Canonical auth + serialization |
| `proxy.ts` | Public route whitelist |
| `types/index.ts` | Shared domain types |

## Migration order (one proposal per step)

1. Extract `requireSession` to `lib/auth-session.ts`
2. Extract `serializeCard` to `lib/cards.ts` (align `app/page.tsx`)
3. Standardize error helpers (optional `lib/api-errors.ts`)
4. Route-specific refactors only after shared helpers exist

## Validation

After any approved refactor:

```bash
npm run validate:backend
npm run typecheck
npm run build
```

- `validate:backend` exit 0 = no critical violations
- `typecheck` exit 0 = TypeScript clean
- `build` exit 0 = Next.js production build succeeds (includes `prisma generate`)

## Golden rule

The diff of HTTP status codes and JSON response shapes seen by the client must be empty after a refactor. Same API behavior, better code organization.

## Limitations

This project has no unit or E2E tests. `npm run build` is the primary integration gate. Document this in every Audit Report.
