import OpenAI from "openai";
import { env } from "@/lib/env";
import { COL_CONFIG, TILE_DEFINITIONS } from "@/lib/col-config";
import type { ClassifyResult, ColId, SenderType } from "@/types";

const openai = new OpenAI({ apiKey: env.openaiApiKey });

const TILE_GUIDE = TILE_DEFINITIONS.map((tile) => {
  const columns = tile.cols
    .map((col) => `- "${col}" (${COL_CONFIG[col].label})`)
    .join("\n");
  return `**${tile.label}** — ${tile.subtitle}\n${columns}`;
}).join("\n\n");

const SYSTEM_PROMPT = `You are an AI email classifier for a professional inbox management tool.
Given an email (from, subject, body), assign exactly one column ("col") and extract structured fields.

The inbox UI has four dashboard categories:

${TILE_GUIDE}

Column rules (pick exactly one "col"):

- "action" — Action Required: needs your reply, decision, file, approval, or scheduling. Not yet overdue.
  Set "deadline" carefully — the UI splits action items into sub-groups:
  • Today — deadline contains "today" or "eod" (e.g. "Today", "Today EOD", "EOD today", "Expiration time/date")
  • Upcoming — any other deadline (e.g. "Next Friday", "By May 30") OR null if no deadline is mentioned
- "overdue" — Action Required > Overdue: missed deadline, unanswered follow-up, payment due notices, second/nudge email, or sender waiting on you after a due date passed. Always prefer "overdue" over "action" when the sender is chasing you or time has run out.
- "invoice" — Invoices: bills, payment receipts, invoices, or charges from Stripe, AWS, SaaS vendors, contractors, or any billing system.
- "sub" — Subscriptions: newsletters, marketing, digests, promotions, product updates, or automated non-financial notifications. No action needed.
- "other" — FYI: informational only — someone sharing context, updates, or awareness items with no response expected.

Disambiguation:
- Financial/payment email → "invoice", not "sub"
- Newsletter or promo with no payment → "sub", not "invoice" or "other"
- Needs a response → "action" or "overdue", never "other"
- Purely informational internal update → "other"

Sender types (pick exactly one "senderType"):
- "client" — customer or external client
- "boss" — manager, CEO, director, or senior leadership
- "colleague" — coworker, teammate, or internal contact
- "auto" — automated system, newsletter, marketing, or SaaS notification
- "unknown" — cannot determine

Return ONLY valid JSON — no markdown, no explanation.`;

const USER_PROMPT = (
  from: string,
  subject: string,
  body: string
) => `From: ${from}
Subject: ${subject}

Body:
${body.slice(0, 3000)}

Classify this email and return JSON with this exact shape:
{
  "col": "action" | "overdue" | "invoice" | "sub" | "other",
  "task": "One concise sentence describing what needs to be done or what the email is about (max 120 chars)",
  "reason": "One sentence explaining why it was classified this way (max 100 chars)",
  "deadline": "Human-readable deadline for action/overdue items. Use 'Today' or 'Today EOD' when due today; a specific date when due later; null for invoice/sub/other or when no deadline exists",
  "senderType": "client" | "boss" | "colleague" | "auto" | "unknown"
}`;

export async function classifyEmail(
  from: string,
  subject: string,
  body: string
): Promise<ClassifyResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: USER_PROMPT(from, subject, body) },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<ClassifyResult>;

  const VALID_COLS: ColId[] = ["action", "overdue", "invoice", "sub", "other"];
  const VALID_TYPES: SenderType[] = [
    "client",
    "boss",
    "colleague",
    "auto",
    "unknown",
  ];

  return {
    col: VALID_COLS.includes(parsed.col as ColId)
      ? (parsed.col as ColId)
      : "other",
    task: parsed.task ?? subject ?? "No task extracted",
    reason: parsed.reason ?? "Classified by AI",
    deadline: parsed.deadline ?? null,
    reply: null,
    senderType: VALID_TYPES.includes(parsed.senderType as SenderType)
      ? (parsed.senderType as SenderType)
      : "unknown",
  };
}

const DRAFT_SYSTEM_PROMPT = `You are a professional email assistant. Write a concise, context-aware reply to the email provided.
Keep it to 3–5 sentences. Be direct, friendly, and professional. Address exactly what the sender is asking for.
Return ONLY the body of the reply — no subject line, no greeting like "Dear ...", no sign-off. Just the reply text.`;

export async function generateDraftReply(
  from: string,
  subject: string,
  body: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: DRAFT_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Write a professional reply to this email:\n\nFrom: ${from}\nSubject: ${subject}\n\n${body.slice(0, 3000)}`,
      },
    ],
  });
  return response.choices[0]?.message?.content?.trim() ?? "";
}
