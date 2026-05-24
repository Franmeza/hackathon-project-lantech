# Backend Standards — Inbox Action Board

Source of truth extracted from the current codebase. New backend work must align with these patterns unless a confirmed Change Proposal explicitly changes a contract.

## Architecture

| Layer | Location | Responsibility |
|---|---|---|
| Route handlers | `app/api/**/route.ts` | HTTP only: parse body/query, auth, status codes, JSON serialization |
| Auth middleware | `proxy.ts` | Redirect unauthenticated users; define public routes |
| NextAuth | `auth.ts`, `auth.config.ts`, `app/api/auth/[...nextauth]/route.ts` | Sessions, OAuth, Prisma adapter |
| Services | `lib/*` | Gmail, OpenAI, DB client, env, shared utilities |
| Domain types | `types/index.ts` | `Card`, `ColId`, `SenderType`, `ClassifyResult` |
| ORM | `prisma/schema.prisma` + `lib/db.ts` | Prisma client singleton |

**Rule:** Business logic (Gmail fetch, AI classification, token refresh) belongs in `lib/`, not in route handlers.

## Environment variables

- Server-side config: read via `lib/env.ts` using `required()` for critical keys.
- `auth.config.ts` uses `process.env` directly (NextAuth provider config — legacy exception).
- `lib/db.ts` uses `process.env.NODE_ENV` for Prisma dev singleton (allowed).
- Client hooks may use `NEXT_PUBLIC_*` env vars directly (not scanned by backend validator).

```typescript
// lib/env.ts — canonical pattern
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}
```

## Public vs protected routes

Defined in `proxy.ts`:

| Path | Auth |
|---|---|
| `/sign-in` | Public |
| `/api/auth/*` | Public |
| `/api/webhook/gmail` | Public (Pub/Sub; no session) |
| All other `/api/*` and pages | Session required |

## Authentication pattern

Canonical pattern from `app/api/cards/route.ts`:

```typescript
import { auth } from "@/auth";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
}

// At start of each handler:
const session = await requireSession();
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

Inline `auth()` checks (as in `app/api/cards/[id]/draft/route.ts`) are acceptable when they follow the same `401` response shape.

## Authorization (user-scoped data)

Before update or delete, always verify ownership:

```typescript
const existing = await prisma.card.findFirst({
  where: { id: body.id, userId: session.user.id },
});
if (!existing) {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
```

Never return a different error for "not found" vs "not yours" — use `404` for both.

## Error response shape

All error responses use a plain JSON object:

```json
{ "error": "<human-readable message>" }
```

| Status | When |
|---|---|
| `401` | No session / missing `session.user.id` |
| `400` | Invalid or missing request input |
| `404` | Resource missing or not owned by user |

Do not add error codes, nested `details`, or stack traces in API responses.

## HTTP contracts (current)

### `GET /api/cards`

- **Auth:** required
- **Success `200`:** `Card[]`
- **Errors:** `401`

### `POST /api/cards`

- **Auth:** required
- **Body:** `{ text: string }`
- **Success `201`:** `Card`
- **Errors:** `401`, `400` `{ error: "No text provided" }`

### `PATCH /api/cards`

- **Auth:** required
- **Body:** `{ id: string; col?: string; archived?: boolean }`
- **Success `200`:** `Card`
- **Errors:** `401`, `400` `{ error: "Missing id" }`, `404`

### `DELETE /api/cards?id=<uuid>`

- **Auth:** required
- **Query:** `id` required
- **Success `200`:** `{ ok: true }`
- **Errors:** `401`, `400` `{ error: "Missing id" }`, `404`

### `POST /api/cards/[id]/draft`

- **Auth:** required
- **Success `200`:** `{ reply: string }`
- **Errors:** `401`, `404`

### `POST /api/webhook/gmail`

- **Auth:** none (Pub/Sub)
- **Success `200`:** `{ ok: true }` — also used for idempotent/no-op cases
- **Errors `400`:** `{ error: "No data" }`, `{ error: "Missing fields" }`
- **Top-level catch:** returns `200 { ok: true }` to avoid Pub/Sub infinite retries

## Card serialization

API routes use `serializeCard` in `app/api/cards/route.ts`:

- `createdAt` → ISO string via `.toISOString()`
- `col` and `senderType` cast to union types from `types/index.ts`

**Known debt:** `app/page.tsx` duplicates serialization in `getUserCards`. Refactors should extract a shared helper without changing the `Card` shape.

## Imports

Prefer path aliases:

```typescript
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
```

Avoid deep relative imports from `app/api/`.

## OpenAI / classification

- API keys via `env.openaiApiKey` from `lib/env.ts`
- AI output columns validated in `lib/openai.ts` (`VALID_COLS`, `VALID_TYPES`) with fallback to safe defaults
- Classification logic stays in `lib/openai.ts`, not in routes

## Logging

- Use `console.error` / `console.warn` for server-side failures
- Never log access tokens, refresh tokens, or API keys
- Never include secrets in JSON responses

## Anti-patterns (prohibited)

| Anti-pattern | Why |
|---|---|
| `process.env.X` in `lib/*` (except `lib/env.ts`, `lib/db.ts`) | Centralize env access |
| Prisma in `app/**/*.tsx` pages (non-API) | Use API routes or shared lib helpers; `app/page.tsx` is known debt |
| User-facing routes without `auth()` | Data leak risk |
| Prisma update/delete without `userId` filter | Cross-user data access |
| Changing status codes or JSON shapes without approval | Breaks client (`hooks/useCards.ts`, components) |
| Returning `500` with stack traces to clients | Security / UX |

## Reference files

| File | Purpose |
|---|---|
| `app/api/cards/route.ts` | Canonical auth, serialization, CRUD contracts |
| `app/api/cards/[id]/draft/route.ts` | Draft reply flow |
| `app/api/webhook/gmail/route.ts` | Pub/Sub idempotency pattern |
| `proxy.ts` | Public route whitelist |
| `types/index.ts` | Domain types shared with client |
| `lib/env.ts` | Environment variable access |
| `lib/db.ts` | Prisma client |
