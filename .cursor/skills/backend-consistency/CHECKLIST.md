# Backend Consistency Checklist

Run after `validate-backend.mjs` and before delivering an Audit Report.

## Auth and routing

- [ ] New or modified API routes call `auth()` (or `requireSession`) unless whitelisted in `proxy.ts`
- [ ] Public routes match `proxy.ts`: `/sign-in`, `/api/auth/*`, `/api/webhook/gmail`
- [ ] Unauthorized requests return `401` with `{ error: "Unauthorized" }`

## Authorization

- [ ] Read/update/delete operations filter by `userId: session.user.id`
- [ ] Missing or foreign resources return `404` with `{ error: "Not found" }`

## Request / response contracts

- [ ] Success bodies match shapes in [STANDARDS.md](STANDARDS.md)
- [ ] Error bodies use `{ error: string }` only
- [ ] `Card.createdAt` is an ISO string in API responses
- [ ] POST create returns `201`; DELETE returns `{ ok: true }`

## Webhook (Gmail Pub/Sub)

- [ ] Invalid payload returns `400` with `{ error: ... }`
- [ ] Unknown user / missing tokens / processing errors return `200 { ok: true }` (idempotency)
- [ ] Duplicate `gmailMsgId` skipped (no duplicate cards)

## Code organization

- [ ] Business logic in `lib/`, not duplicated across routes
- [ ] Env vars read via `lib/env.ts` on the server (except `auth.config.ts` / `lib/db.ts`)
- [ ] Imports use `@/` aliases
- [ ] Domain types imported from `types/index.ts`

## Security

- [ ] No secrets, tokens, or API keys in responses or logs
- [ ] No hardcoded credentials in source

## Verification pipeline

- [ ] `npm run validate:backend` — exit 0 (no critical violations)
- [ ] `npm run typecheck` — exit 0
- [ ] `npm run build` — exit 0

## Regression flows (manual, when contracts or data layer change)

- [ ] Paste message → POST `/api/cards` → card appears
- [ ] Drag card / archive → PATCH `/api/cards`
- [ ] Delete card → DELETE `/api/cards?id=...`
- [ ] Generate draft → POST `/api/cards/[id]/draft` → `{ reply }`
- [ ] Gmail webhook → card created (if Pub/Sub configured)

## Known debt (report-only until user approves refactor)

- [ ] `app/page.tsx` duplicates card serialization (vs `serializeCard` in API route)
- [ ] `auth.config.ts` uses raw `process.env` (NextAuth provider config)
- [ ] No automated unit/E2E tests — build is the integration gate
