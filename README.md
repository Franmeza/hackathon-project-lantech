# Smart Inbox

> AI-powered Gmail triage — know what needs your attention before you open a single email.

---

## Problem

Professionals spend 28% of their workweek managing email. The cognitive load of opening, reading, and deciding what to do with each message is exhausting — and most emails don't even need a response. There is no fast, intelligent way to see *what actually matters* in your inbox without reading everything yourself.

---

## Solution

Smart Inbox connects to your Gmail account and automatically classifies every incoming email using GPT-5-mini. Emails are grouped into four categories on a visual dashboard:

| Category | What it means |
|---|---|
| **Action Required** | You need to reply, decide, or send something |
| **Invoices** | Bills, receipts, and payment requests |
| **Subscriptions** | Newsletters and automated notifications |
| **FYI** | Informational updates that need no response |

Within Action Required, emails are further sorted into **Overdue**, **Today**, and **Upcoming** based on detected deadlines. Each email card includes an AI-generated task summary, the reason for its classification, and a draft reply — ready to copy with one click.

---

## Demo Flow

1. Open the app — the dashboard shows a summary tile for each category with live email counts and an AI digest
2. Click **Action Required** to see emails split across Overdue / Today / Upcoming columns
3. Drag a card to a different column to reclassify it
4. Expand a card to read the AI task summary, deadline, and pre-written draft reply
5. Click **Archive** on any card to move it out of the board
6. Use **Paste message** in the toolbar to manually drop in any email or Slack message for instant AI classification
7. The board refreshes automatically every 15 seconds as new emails arrive

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth v5 — Google OAuth with `gmail.readonly` scope |
| Email pipeline | Gmail API + Google Cloud Pub/Sub (push webhooks) |
| AI classification | OpenAI GPT-5-mini with JSON mode |
| Database | Prisma ORM + Supabase (PostgreSQL) |
| Data fetching | SWR — polls `/api/cards` every 15 seconds |
| Deployment | Vercel |

---

## Architecture

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
              │  SWR poll every 15s
              ▼
        React Dashboard UI
```

**Auth flow:** User signs in with Google → NextAuth stores OAuth tokens in DB → calls `gmail.users.watch` to register Pub/Sub subscription → all future emails push to the webhook automatically.

---

## Project Structure

```
├── app/
│   ├── page.tsx                         server component, SSR initial cards
│   └── api/
│       ├── auth/[...nextauth]/route.ts  NextAuth OAuth handlers
│       ├── cards/route.ts               GET / POST / PATCH / DELETE
│       └── webhook/gmail/route.ts       Pub/Sub push receiver
├── components/
│   ├── Dashboard/   DashboardView, SummaryTile
│   ├── Board/       InboxBoard, Column, ActionDetailView
│   ├── Card/        EmailCard, ArchiveCard
│   ├── Archive/     ArchiveView
│   ├── Sidebar/     Sidebar
│   └── PasteMessage/
├── lib/
│   ├── openai.ts    classifyEmail() — GPT-5-mini with structured JSON output
│   ├── gmail.ts     fetchMessage, registerWatch, getNewMessageIds
│   ├── db.ts        Prisma singleton
│   └── col-config.ts  column + tile definitions
├── hooks/useCards.ts  SWR polling hook
├── types/index.ts     shared Card, ColId, TileDefinition types
├── auth.ts            NextAuth config + Gmail watch registration on sign-in
└── prisma/schema.prisma
```

---

## Setup

### 1. Install

```bash
npm install
cp .env.local.example .env.local
```

### 2. Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=   # Supabase > Project Settings > API
SUPABASE_SERVICE_ROLE_KEY=  # Supabase service role key (server-side only)
DATABASE_URL=               # Supabase Postgres pooler URI (port 6543) — required for Prisma
NEXTAUTH_SECRET=            # openssl rand -base64 32
NEXTAUTH_URL=               # http://localhost:3000 (or Vercel URL)
GOOGLE_CLIENT_ID=           # Google Cloud OAuth client
GOOGLE_CLIENT_SECRET=
GOOGLE_PUBSUB_TOPIC=        # projects/YOUR_PROJECT/topics/gmail-push
OPENAI_API_KEY=
```

### 3. Database

```bash
npx prisma migrate dev --name init
```

### 4. Google Cloud (one-time)

1. Enable **Gmail API** and **Cloud Pub/Sub** in your GCP project
2. Create OAuth credentials (Web app) — add `/api/auth/callback/google` as redirect URI
3. Add your Gmail as a test user on the OAuth consent screen
4. Create a Pub/Sub topic `gmail-push` with a push subscription pointing to `/api/webhook/gmail`
5. Grant `gmail-api-push@system.gserviceaccount.com` the `roles/pubsub.publisher` role on the topic

### 5. Run

```bash
npm run dev
```

---

## Limitations

- **Per-user cards** — each signed-in user sees only their own cards
- **Gmail only** — no Outlook, Apple Mail, or other providers
- **Sign-in at `/sign-in`** — Google OAuth; only new emails after connect are processed (no inbox import)
- **Push webhook requires public URL** — local development needs ngrok or a similar tunnel for real email ingestion; the Paste Message feature works locally without it
- **Classification accuracy** — GPT-5-mini is good but not perfect; edge cases (e.g. hybrid action/invoice emails) may land in the wrong column
- **No token refresh handling** — if the OAuth access token expires and refresh fails, email ingestion pauses until the user re-authenticates

---

## Future Work

- Multi-user support with per-user card scoping
- Sign-in page and onboarding flow
- Token auto-refresh and watch renewal (Gmail watches expire after 7 days)
- Reply directly from the board via Gmail API (`gmail.send` scope)
- Bulk actions — archive all subscriptions, mark all FYIs as read
- Mobile-responsive layout
- Slack / Teams integration alongside Gmail
- Confidence score on AI classification with manual override history fed back as few-shot examples
