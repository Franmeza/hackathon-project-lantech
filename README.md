# Smart Inbox

AI-powered Gmail triage for busy professionals — know what needs your attention before you open a single email.

## Problem

Professionals spend 28% of their workweek managing email. The cognitive load of opening, reading, and deciding what to do with each message is exhausting — and most emails don't even need a response. There is no fast, intelligent way to see *what actually matters* in your inbox without reading everything yourself.

## Solution

Smart Inbox connects to your Gmail account and automatically classifies every incoming email using GPT-5-mini. Emails appear on a visual dashboard grouped into four categories:

| Category | What it means |
|---|---|
| **Action Required** | You need to reply, decide, or send something |
| **Invoices** | Bills, receipts, and payment requests |
| **Subscriptions** | Newsletters and automated notifications |
| **FYI** | Informational updates that need no response |

Within Action Required, emails are further sorted into **Overdue**, **Today**, and **Upcoming** based on detected deadlines. Each email card includes an AI-generated task summary, the reason for its classification, and a draft reply — ready to copy with one click.

## Demo Flow

1. Open the app at `/sign-in` and sign in with Google
2. The dashboard shows a summary tile for each category with live email counts and an AI digest
3. Click **Action Required** to see emails split across Overdue / Today / Upcoming columns
4. Drag a card to a different column to reclassify it
5. Click a card to read the full original email in a modal
6. From the modal, **Open in Gmail** to reply, or **Delete** to move the message to Gmail Trash
7. Expand a card to read the AI task summary, deadline, and pre-written draft reply
8. Click **Archive** on any card to move it out of the board
9. Use **Paste message** in the toolbar to manually drop in any email or Slack message for instant AI classification (works locally without Gmail push)
10. Use **Select** to bulk archive, delete, or reclassify multiple cards at once
11. New cards arrive in near real time via Supabase Realtime (with a SWR safety-net refresh)

## Key Features

- **Automatic Gmail triage** — new messages are classified on arrival via Gmail push webhooks
- **Four-category dashboard** — Action Required, Invoices, Subscriptions, and FYI at a glance
- **Deadline-aware action board** — Overdue / Today / Upcoming columns inside Action Required
- **AI summaries and draft replies** — task text, classification reason, and copy-ready reply per card
- **Drag-and-drop reclassification** — move cards between columns; changes persist to the database
- **Full message modal** — load the original Gmail body on demand; open in Gmail or trash from the app
- **Paste Message** — classify arbitrary pasted text without waiting for a webhook (useful for local demos)
- **Bulk actions** — select multiple cards to archive, delete, or reclassify at once
- **Per-user isolation** — each signed-in user sees only their own cards
- **Near real-time updates** — Supabase Realtime with SWR fallback polling

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend:** Next.js Route Handlers, NextAuth v5 server actions
- **AI / model / API:** OpenAI GPT-5-mini (structured JSON classification + draft replies), Gmail API, Google Cloud Pub/Sub
- **Data / storage:** Prisma ORM, Supabase PostgreSQL, Supabase Realtime
- **Deployment:** Vercel

## Architecture

For a full walkthrough of how the app works, data flow, and module layout, see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

```
Gmail Inbox
    │
    │  push notification (Pub/Sub)
    ▼
POST /api/webhook/gmail
    │
    ├─► Gmail API — fetch full message body
    │
    ├─► OpenAI GPT-5-mini — classify into col + task + reason + deadline + draft reply
    │
    └─► Supabase (PostgreSQL) — upsert Card row
              │
              │  Supabase Realtime push (≈1s)
              │  + SWR safety-net poll (60s with Realtime, 30s without)
              ▼
        React Dashboard UI
```

**Auth flow:** User signs in with Google → NextAuth stores OAuth tokens in the database → the app calls `gmail.users.watch` to register a Pub/Sub subscription → future emails push to the webhook automatically.

## How to Run

### Prerequisites

- Node.js 20+
- Accounts and keys for: Supabase, Google Cloud (Gmail API + Pub/Sub + OAuth), OpenAI
- For live Gmail ingestion in local dev: a public HTTPS tunnel (e.g. ngrok) pointing at `/api/webhook/gmail`

### 1. Install

```bash
npm install
cp .env.local.example .env.local
```

Fill in all values in `.env.local`. **Never commit this file** — only `.env.local.example` belongs in the repo.

### 2. Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key (browser Realtime) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server only) |
| `DATABASE_URL` | Supabase Postgres pooler URI (port 6543) — Prisma runtime |
| `DIRECT_URL` | Supabase Postgres direct URI (port 5432) — Prisma migrations |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` locally, or your Vercel URL in production |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth web client |
| `GOOGLE_PUBSUB_TOPIC` | e.g. `projects/YOUR_PROJECT/topics/gmail-push` |
| `OPENAI_API_KEY` | OpenAI API key |

### 3. Database

```bash
npx prisma migrate dev
```

### 4. Google Cloud (one-time)

1. Enable **Gmail API** and **Cloud Pub/Sub** in your GCP project
2. Create OAuth credentials (Web application) — add `http://localhost:3000/api/auth/callback/google` (and your production URL) as redirect URIs
3. Add your Gmail address as a test user on the OAuth consent screen
4. Create a Pub/Sub topic `gmail-push` with a push subscription pointing to `https://YOUR_PUBLIC_URL/api/webhook/gmail`
5. Grant `gmail-api-push@system.gserviceaccount.com` the `roles/pubsub.publisher` role on the topic

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/sign-in`.

**Local demo without Gmail push:** use **Paste message** on the dashboard to classify sample email text instantly.

### Production build

```bash
npm run build
npm start
```

## What We Built During the Hackathon

We shipped a working vertical slice of an AI inbox assistant:

- **End-to-end Gmail pipeline** — OAuth sign-in, watch registration, Pub/Sub webhook ingestion, and message fetch
- **AI classification layer** — structured GPT-5-mini output for category, task summary, reason, deadline, and draft reply
- **Interactive dashboard** — category tiles, kanban-style action board, drag-and-drop, archive view, and bulk actions
- **Realtime UX** — Supabase Realtime subscriptions with SWR fallback so the board stays current without manual refresh
- **Demo-friendly paste flow** — classify arbitrary text when webhooks are unavailable (local dev or judges without Gmail access)

## External Tools / Libraries / APIs

| Tool | Role | License / terms |
|---|---|---|
| [OpenAI API](https://openai.com/policies) (GPT-5-mini) | Email classification, summaries, draft replies | [OpenAI Terms of Use](https://openai.com/policies/terms-of-use) |
| [Gmail API](https://developers.google.com/gmail/api) | Read messages, trash, inbox watch | [Google APIs Terms of Service](https://developers.google.com/terms) |
| [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) | Push notifications for new mail | Google Cloud Terms |
| [Next.js](https://nextjs.org/) | Full-stack React framework | MIT |
| [NextAuth.js](https://next-auth.js.org/) | Google OAuth session management | ISC |
| [Prisma](https://www.prisma.io/) | ORM and migrations | Apache 2.0 |
| [Supabase](https://supabase.com/) | PostgreSQL hosting + Realtime | [Supabase Terms](https://supabase.com/terms) |
| [SWR](https://swr.vercel.app/) | Client data fetching / polling | MIT |
| [Tailwind CSS](https://tailwindcss.com/) | Styling | MIT |
| [Tabler Icons](https://tabler.io/icons) | UI icons | MIT |
| [googleapis](https://github.com/googleapis/google-api-nodejs-client) | Gmail API client | Apache 2.0 |

No third-party email datasets were used — classification runs on the signed-in user's own Gmail messages (or pasted demo text).

## Limitations

- **Gmail only** — no Outlook, Apple Mail, or other providers
- **New mail after connect** — existing inbox history is not backfilled on sign-in
- **Push webhook requires a public URL** — local Gmail ingestion needs ngrok or similar; Paste Message works without it
- **Classification accuracy** — GPT-5-mini is good but not perfect; hybrid emails (e.g. invoice + action) may land in the wrong column
- **No send from app** — replies open in Gmail; the OAuth scope is read + trash only
- **Token refresh / watch renewal** — if OAuth refresh fails or the 7-day Gmail watch expires, ingestion pauses until re-authentication or manual watch re-registration (`/api/debug/register-watch`)

## Future Work

- Automatic OAuth token refresh and Gmail watch renewal
- Reply directly from the board via Gmail API (`gmail.send` scope)
- Advanced bulk actions — e.g. archive all subscriptions, mark all FYIs as read
- Slack / Teams integration alongside Gmail
- Confidence score on AI classification with manual override history fed back as few-shot examples
- Inbox backfill on first connect

## Screenshots

> Add 2–3 captures before portal submission (dashboard overview, Action Required board, message modal with draft reply). Suggested paths: `docs/screenshots/dashboard.png`, `docs/screenshots/action-board.png`, `docs/screenshots/message-modal.png`.

## Project Structure

```
├── app/
│   ├── page.tsx                         server component, SSR initial cards
│   ├── sign-in/page.tsx                 marketing + Google OAuth entry
│   ├── actions/auth.ts                  server actions (signIn / signOut)
│   └── api/
│       ├── auth/[...nextauth]/route.ts  NextAuth OAuth handlers
│       ├── cards/route.ts               GET / POST / PATCH / DELETE
│       ├── cards/bulk/route.ts          PATCH bulk archive / restore / reclassify
│       ├── cards/[id]/draft/route.ts    POST generate AI draft reply
│       ├── cards/[id]/message/route.ts  GET full Gmail message for modal
│       ├── debug/register-watch/route.ts diagnostics + manual watch re-registration
│       └── webhook/gmail/route.ts       Pub/Sub push receiver
├── components/
│   ├── Dashboard/   DashboardView, ActionHeroTile, CategoryTile
│   ├── Board/       InboxBoard, Column, ActionDetailView
│   ├── Card/        EmailCard, ArchiveCard, MessageModal
│   ├── Archive/     ArchiveView
│   ├── RightPanel/  AI overview panel
│   ├── Sidebar/     Sidebar
│   └── PasteMessage/
├── lib/
│   ├── openai.ts    classifyEmail() — GPT-5-mini with structured JSON output
│   ├── gmail.ts     fetchMessage, registerWatch, getNewMessageIds, trashMessage
│   ├── db.ts        Prisma singleton
│   └── col-config.ts  column + tile definitions
├── hooks/
│   ├── useCards.ts          Supabase Realtime + SWR safety-net refresh
│   └── useCardSelection.ts  bulk-selection state
├── types/
│   ├── index.ts             shared Card, ColId, TileDefinition types
│   └── next-auth.d.ts       Session.user.id type augmentation
├── auth.ts            NextAuth config + Gmail watch registration on sign-in
├── auth.config.ts     edge-safe NextAuth config (used by proxy.ts)
├── proxy.ts           auth middleware (Next.js route protection)
└── prisma/schema.prisma
```

---

## Portal Submission (copy-paste)

### Project name

**Smart Inbox**

### Description

```text
Smart Inbox is an AI-powered email triage assistant for busy professionals that helps them turn an overwhelming Gmail inbox into a prioritized action board with summaries and draft replies.

In the demo, users can sign in with Google, see emails auto-sorted into Action Required / Invoices / Subscriptions / FYI, drag cards between deadline columns, open full messages, and copy AI draft replies. We focused on a real-time Gmail → Pub/Sub → GPT-5-mini → Supabase pipeline and built a working vertical slice that shows how much time you save when only actionable mail surfaces first.

Tech stack: Next.js, TypeScript, Tailwind, NextAuth, Gmail API, Google Pub/Sub, OpenAI GPT-5-mini, Prisma, Supabase, Vercel.
```

### GitHub repo URL

Set your public repo URL before submitting (e.g. `https://github.com/YOUR_ORG/smart-inbox`).

---

## Submission Checklist

- [ ] Repo is public
- [x] README is clear
- [x] App runs from documented instructions
- [x] Demo path is described
- [x] Tech stack listed
- [x] External APIs/libraries credited
- [x] Known limitations included
- [ ] Screenshots added under `docs/screenshots/`
- [x] No secrets/API keys committed (use `.env.local` only; see `.env.local.example`)
- [ ] Commit history is reasonable
