# Smart Inbox — Architecture Overview

High-level summary of how the app works, how the pieces connect, and how data flows end to end.

---

## What this app does

**Smart Inbox** is a Next.js (App Router) web app that turns a Google inbox into an AI-triaged Kanban board.

### End-to-end flow

1. **Sign-in (Google OAuth)** — NextAuth v5 with the Prisma adapter persists user, account, and session rows in Supabase Postgres. On sign-in (`auth.ts` → `events.signIn`), the latest OAuth tokens are written to the `Account` row and `gmail.users.watch` is called to subscribe the user's inbox to a Google Cloud Pub/Sub topic.

2. **Email ingestion (push, near real-time)** — Google Pub/Sub POSTs a notification to `POST /api/webhook/gmail` whenever a new INBOX message arrives. The route decodes the base64 payload, finds the user by email, calls `gmail.users.history.list` from the last stored `historyId`, fetches each new message body via `gmail.users.messages.get`, classifies it with OpenAI (`lib/openai.ts` → `classifyEmail`), and upserts a `Card` row keyed on `gmailMsgId`.

3. **AI classification** — `lib/openai.ts` calls GPT-5-mini in JSON mode with a strict system prompt. The model returns `{ col, task, reason, deadline, senderType }`. Allowed values are whitelisted; unsafe outputs fall back to safe defaults (`col: "other"`, `senderType: "unknown"`).

4. **Dashboard UI** — `app/page.tsx` SSRs the user's `Card[]` (via `lib/card-serializer.ts`) and passes them to the client-side `InboxBoard`. The UI has three layers:
   - **DashboardView** — `ActionHeroTile` + three `CategoryTile`s grouping columns (`invoice`, `other`, `sub`).
   - **Action detail** — three columns (Overdue / Today / Upcoming) derived from `col` + `deadline` parsing in `lib/dashboard-utils.ts`.
   - **Other detail / Archive** — generic `Column` per `ColId`, drag-and-drop reclassification, archive, and bulk actions.

5. **Live updates** — `hooks/useCards.ts` subscribes to Supabase Realtime (`postgres_changes` on the `Card` table) and triggers an SWR re-fetch from `/api/cards` on every event (auth + user scoping run on the server). A 30s / 60s SWR poll is the safety net when Realtime is disabled or misses an event.

6. **Per-card actions** — `MessageModal` lazy-loads the full Gmail message (`GET /api/cards/[id]/message`) with inline-image resolution and renders it in a sandboxed iframe; **Open in Gmail** and **Delete** (Gmail trash) are available from the modal. `EmailCard` generates a draft reply on demand via `POST /api/cards/[id]/draft`.

7. **Auth guarding** — `proxy.ts` (Next.js middleware) whitelists `/sign-in`, `/api/auth/*`, and `/api/webhook/gmail`; everything else redirects to `/sign-in` when unauthenticated.

---

## Architecture diagram

```
                ┌────────────────────────────────────────────────────────┐
                │                  Gmail (per user inbox)                │
                └────────────────────────┬───────────────────────────────┘
                                         │ users.watch (gmail.modify scope)
                                         ▼
                ┌────────────────────────────────────────────────────────┐
                │   Google Cloud Pub/Sub topic "gmail-push" (push sub)   │
                └────────────────────────┬───────────────────────────────┘
                                         │ POST {message:{data:base64}}
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Next.js App Router (Node runtime, deployed to Vercel)                            │
│                                                                                  │
│  proxy.ts (auth middleware) ─── whitelists /api/webhook/gmail, /api/auth/*       │
│                                                                                  │
│  app/api/webhook/gmail/route.ts                                                  │
│     → lib/gmail.ts: getNewMessageIds → fetchGmailMessage                         │
│     → lib/openai.ts: classifyEmail (GPT-5-mini)                                  │
│     → prisma.card.upsert(gmailMsgId)                                             │
│                                                                                  │
│  app/api/cards/route.ts          GET / POST / PATCH / DELETE (user-scoped)       │
│  app/api/cards/bulk/route.ts     PATCH bulk archive / restore / reclassify       │
│  app/api/cards/[id]/draft        POST generate AI draft reply                    │
│  app/api/cards/[id]/message      GET full Gmail message (HTML + inline images)   │
│  app/api/auth/[...nextauth]      NextAuth handlers (Google OAuth)                │
└──────────────┬─────────────────────────────────────────────────────┬─────────────┘
               │ Prisma (singleton, lib/db.ts)                       │ supabase-js
               ▼                                                     ▼
       ┌─────────────────────────────┐                ┌─────────────────────────────┐
       │ Supabase Postgres           │                │ Supabase Realtime channel   │
       │  - User / Account / Session │  postgres      │   table=Card, event=*       │
       │  - Card (userId-scoped)     │  changes ────► │   → triggers SWR re-fetch   │
       └─────────────────────────────┘                └──────────────┬──────────────┘
                                                                     │
                                                                     ▼
                                                  ┌──────────────────────────────┐
                                                  │ React client (InboxBoard)    │
                                                  │  hooks/useCards.ts (SWR +    │
                                                  │  Realtime), components/...   │
                                                  └──────────────────────────────┘
```

---

## Module layering

| Layer | Location | Responsibility |
|---|---|---|
| Routing / SSR | `app/` | Pages stay thin; `app/page.tsx` loads initial cards via Prisma + `serializeCard`. |
| API handlers | `app/api/**/route.ts` | HTTP only — parse, auth, status codes, JSON. |
| Auth | `auth.ts`, `auth.config.ts`, `proxy.ts` | Split edge-safe config (middleware) from full DB-aware NextAuth setup. |
| Services | `lib/{openai,gmail,supabase,db,env,card-serializer,…}.ts` | Business logic and shared utilities. |
| Domain types | `types/index.ts`, `types/next-auth.d.ts` | `Card`, `ColId`, `SenderType`, `ClassifyResult`, session augmentation. |
| Hooks | `hooks/useCards.ts`, `hooks/useCardSelection.ts` | Client-side data and selection state. |
| Components | `components/{Board,Card,Dashboard,…}` | UI; styling tokens in `lib/ui-tokens.ts`, column config in `lib/col-config.ts`. |

---

## Data model (core)

| Model | Purpose |
|---|---|
| `User` | NextAuth user; owns `Card[]`. |
| `Account` | Google OAuth tokens, `gmailHistoryId`, `gmailWatchExpiry`. |
| `Session` | NextAuth session (JWT strategy; adapter still used for account linking). |
| `Card` | One triaged email (or pasted message): `col`, `task`, `reason`, `deadline`, optional `gmailMsgId`, scoped by `userId`. |

**Column IDs (`ColId`):** `action`, `overdue`, `invoice`, `sub`, `other`.

Dashboard tiles aggregate columns — e.g. the Action tile includes both `action` and `overdue`.

---

## Key API routes

| Route | Auth | Role |
|---|---|---|
| `GET/POST/PATCH/DELETE /api/cards` | Session | CRUD for cards; paste-to-classify via `POST`. |
| `PATCH /api/cards/bulk` | Session | Bulk archive, restore, reclassify. |
| `POST /api/cards/[id]/draft` | Session | On-demand AI draft reply. |
| `GET /api/cards/[id]/message` | Session | Full Gmail body for modal. |
| `POST /api/webhook/gmail` | None (Pub/Sub) | Ingest new emails. |
| `GET /api/debug/register-watch` | Session, dev only | Diagnostics + manual watch re-registration. |

---

## External services

| Service | Usage |
|---|---|
| **Google OAuth + Gmail API** | Sign-in, fetch messages, trash, push watch. Scope: `gmail.modify`. |
| **Google Cloud Pub/Sub** | Push notifications to `/api/webhook/gmail`. |
| **OpenAI GPT-5-mini** | Email classification (JSON) and draft replies. |
| **Supabase Postgres** | Primary database via Prisma. |
| **Supabase Realtime** | Browser subscription to `Card` table changes. |

---

## Auth flow (detail)

```
User → /sign-in → Google OAuth
  → NextAuth callback → User + Account rows in Postgres
  → events.signIn → persist tokens + registerGmailWatch()
  → JWT session with session.user.id
  → proxy.ts protects all routes except sign-in, auth API, webhook
```

Gmail watches expire after ~7 days; token refresh is handled in `lib/gmail.ts` via the OAuth2 client's `tokens` event listener, which persists refreshed access tokens back to the `Account` row.

---

## Client update strategy

```
Card INSERT/UPDATE/DELETE in Postgres
  → Supabase Realtime event
  → useCards mutate() → GET /api/cards (user-filtered)
  → InboxBoard re-renders

Fallback: SWR refreshInterval (60s with Realtime, 30s without)
```

Initial page load uses SSR cards from `app/page.tsx`; SWR uses them as `fallbackData` to avoid a loading flash.

---

## Project structure (reference)

```
app/
  page.tsx                    SSR home + initial cards
  sign-in/page.tsx            marketing + Google sign-in
  actions/auth.ts             server actions (signIn / signOut)
  api/
    auth/[...nextauth]/       OAuth handlers
    cards/                    CRUD + bulk
    cards/[id]/draft          AI draft reply
    cards/[id]/message        Gmail message fetch
    webhook/gmail/            Pub/Sub receiver
    debug/register-watch/     dev-only diagnostics

components/
  Board/                      InboxBoard, columns, bulk actions
  Card/                       EmailCard, MessageModal, ArchiveCard
  Dashboard/                  tiles and hero
  Archive/, Sidebar/, RightPanel/, PasteMessage/, SignIn/, Auth/, ui/

lib/
  openai.ts                   classifyEmail, generateDraftReply
  gmail.ts                    fetch, watch, trash, history
  card-serializer.ts          Prisma row → Card type
  col-config.ts               column + tile definitions
  sender-config.ts            sender type labels/badges
  db.ts, env.ts, supabase.ts, cards-api.ts, dashboard-utils.ts, ui-tokens.ts

hooks/                        useCards, useCardSelection
types/                        shared TypeScript types
auth.ts, auth.config.ts       NextAuth
proxy.ts                      route protection middleware
prisma/schema.prisma          database schema
```

---

## Local development notes

- **Paste Message** works without a public URL — useful when Pub/Sub cannot reach localhost.
- **Live Gmail ingestion** requires a tunnel (ngrok, Cloudflare, etc.) so Pub/Sub can POST to `/api/webhook/gmail`.
- **Debug watch endpoint** (`/api/debug/register-watch`) returns 404 in production.

For setup steps and environment variables, see [README.md](./README.md).
