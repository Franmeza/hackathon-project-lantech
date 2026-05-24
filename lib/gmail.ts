import { google } from "googleapis";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

function createOAuth2Client(accessToken: string, refreshToken?: string, userId?: string) {
  const client = new google.auth.OAuth2(
    env.googleClientId,
    env.googleClientSecret
  );
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // When googleapis auto-refreshes an expired token, save the new one to the DB
  // so the next webhook call doesn't need to refresh again.
  if (userId) {
    client.on("tokens", (tokens) => {
      if (tokens.access_token) {
        prisma.account
          .updateMany({
            where: { userId, provider: "google" },
            data: {
              access_token: tokens.access_token,
              ...(tokens.expiry_date && {
                expires_at: Math.floor(tokens.expiry_date / 1000),
              }),
            },
          })
          .catch((err) => console.error("Failed to persist refreshed token:", err));
      }
    });
  }

  return client;
}

export interface ParsedEmail {
  from: string;
  subject: string;
  body: string;
  html: string | null;
  messageId: string;
  date: string;
}

function getHeader(
  headers: { name?: string | null; value?: string | null }[],
  name: string
): string {
  return (
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ??
    ""
  );
}

function decodeBase64(encoded: string): string {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

function extractTextBody(
  payload: {
    mimeType?: string | null;
    body?: { data?: string | null } | null;
    parts?: Array<{
      mimeType?: string | null;
      body?: { data?: string | null } | null;
      parts?: unknown[];
    }> | null;
  } | undefined
): string {
  if (!payload) return "";

  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64(payload.body.data);
  }

  if (payload.mimeType === "text/html" && payload.body?.data) {
    // Strip basic HTML tags as fallback
    return decodeBase64(payload.body.data).replace(/<[^>]+>/g, " ");
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractTextBody(part as Parameters<typeof extractTextBody>[0]);
      if (text) return text;
    }
  }

  return "";
}

// ─── Types for internal MIME traversal ───────────────────────────────────────

type MimePart = {
  mimeType?: string | null;
  headers?: { name?: string | null; value?: string | null }[] | null;
  body?: { data?: string | null; attachmentId?: string | null } | null;
  parts?: MimePart[] | null;
};

// ─── HTML body extraction ─────────────────────────────────────────────────────

function extractHtmlBody(payload: MimePart | undefined): string | null {
  if (!payload) return null;
  if (payload.mimeType === "text/html" && payload.body?.data) {
    return decodeBase64(payload.body.data);
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const html = extractHtmlBody(part);
      if (html) return html;
    }
  }
  return null;
}

// ─── Inline image extraction ──────────────────────────────────────────────────

type InlineImage = { contentId: string; mimeType: string; attachmentId: string };

function collectInlineImages(payload: MimePart | undefined, out: InlineImage[] = []): InlineImage[] {
  if (!payload) return out;
  if (payload.mimeType?.startsWith("image/") && payload.body?.attachmentId) {
    const cid = (payload.headers ?? [])
      .find((h) => h.name?.toLowerCase() === "content-id")
      ?.value?.replace(/^<|>$/g, "")
      .trim();
    if (cid) {
      out.push({ contentId: cid, mimeType: payload.mimeType, attachmentId: payload.body.attachmentId });
    }
  }
  if (payload.parts) {
    for (const part of payload.parts) collectInlineImages(part, out);
  }
  return out;
}

// ─── Inject baseline styles into an HTML email string ────────────────────────

function withBaseStyles(html: string): string {
  const style = `<style>
    *,*::before,*::after{box-sizing:border-box}
    html,body{margin:0;padding:0;overflow:hidden;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:13px;line-height:1.65;color:#374151;word-break:break-word;overflow-wrap:break-word}
    img{max-width:100%;height:auto;display:block}
    a{color:#4f46e5}
    blockquote{border-left:2px solid #e5e7eb;margin:8px 0;padding:0 0 0 12px;color:#9ca3af}
    pre,code{font-family:ui-monospace,monospace;font-size:12px;background:#f3f4f6;padding:2px 4px;border-radius:3px}
    table{border-collapse:collapse;max-width:100%}
    td,th{padding:4px 8px}
  </style>`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/(<head[^>]*>)/i, `$1${style}`);
  if (/<html[^>]*>/i.test(html)) return html.replace(/(<html[^>]*>)/i, `$1<head>${style}</head>`);
  return `<!doctype html><html><head>${style}</head><body>${html}</body></html>`;
}

// ─── fetchGmailMessage ────────────────────────────────────────────────────────

export async function fetchGmailMessage(
  messageId: string,
  accessToken: string,
  refreshToken?: string,
  userId?: string,
  options?: { includeHtml?: boolean }
): Promise<ParsedEmail> {
  const auth = createOAuth2Client(accessToken, refreshToken, userId);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const msg = res.data;
  const headers = msg.payload?.headers ?? [];

  const base: ParsedEmail = {
    messageId,
    from: getHeader(headers, "From"),
    subject: getHeader(headers, "Subject"),
    date: getHeader(headers, "Date"),
    body: extractTextBody(msg.payload),
    html: null,
  };

  if (!options?.includeHtml) return base;

  const rawHtml = extractHtmlBody(msg.payload as MimePart);
  if (!rawHtml) return base;

  // Resolve cid: inline-image references → data: URIs in parallel
  const inlineImages = collectInlineImages(msg.payload as MimePart);
  const resolved = await Promise.all(
    inlineImages.map(async (img) => {
      try {
        const att = await gmail.users.messages.attachments.get({
          userId: "me",
          messageId,
          id: img.attachmentId,
        });
        const data = att.data.data?.replace(/-/g, "+").replace(/_/g, "/") ?? "";
        return { contentId: img.contentId, dataUri: `data:${img.mimeType};base64,${data}` };
      } catch {
        return null;
      }
    })
  );

  let html = rawHtml;
  for (const r of resolved) {
    if (!r) continue;
    // Gmail HTML uses cid:xxx — replace all occurrences, escaped or not
    html = html.replace(
      new RegExp(`cid:${r.contentId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "gi"),
      r.dataUri
    );
  }

  return { ...base, html: withBaseStyles(html) };
}

/**
 * Move a Gmail message to trash.
 * Requires the gmail.modify scope (superset of gmail.readonly).
 */
export async function trashGmailMessage(
  messageId: string,
  accessToken: string,
  refreshToken?: string,
  userId?: string
): Promise<void> {
  const auth = createOAuth2Client(accessToken, refreshToken, userId);
  const gmail = google.gmail({ version: "v1", auth });
  await gmail.users.messages.trash({ userId: "me", id: messageId });
}

/**
 * Register Gmail push notifications via Cloud Pub/Sub.
 * Should be called after user signs in for the first time.
 */
export async function registerGmailWatch(
  userId: string,
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  const topic = env.googlePubsubTopic;
  if (!topic) {
    console.warn("GOOGLE_PUBSUB_TOPIC not set — skipping gmail watch");
    return;
  }

  const auth = createOAuth2Client(accessToken, refreshToken, userId);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.watch({
    userId: "me",
    requestBody: {
      topicName: topic,
      labelIds: ["INBOX"],
    },
  });

  // Persist the history ID and watch expiry so we know where to resume
  await prisma.account.updateMany({
    where: { userId, provider: "google" },
    data: {
      gmailHistoryId: res.data.historyId ?? null,
      gmailWatchExpiry: res.data.expiration
        ? new Date(parseInt(res.data.expiration))
        : null,
    },
  });
}

/**
 * List new message IDs that arrived after a given historyId.
 */
export async function getNewMessageIds(
  startHistoryId: string,
  accessToken: string,
  refreshToken?: string,
  userId?: string
): Promise<string[]> {
  const auth = createOAuth2Client(accessToken, refreshToken, userId);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.history.list({
    userId: "me",
    startHistoryId,
    historyTypes: ["messageAdded"],
    labelId: "INBOX",
  });

  const messageIds: string[] = [];
  for (const record of res.data.history ?? []) {
    for (const msg of record.messagesAdded ?? []) {
      if (msg.message?.id) messageIds.push(msg.message.id);
    }
  }

  return messageIds;
}

/**
 * Retrieve the most recent Google account for a user from the DB.
 */
export async function getAccountTokens(
  userId: string
): Promise<{
  accessToken: string;
  refreshToken: string | null;
  historyId: string | null;
} | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: {
      access_token: true,
      refresh_token: true,
      gmailHistoryId: true,
    },
  });

  if (!account?.access_token) return null;

  return {
    accessToken: account.access_token,
    refreshToken: account.refresh_token ?? null,
    historyId: account.gmailHistoryId ?? null,
  };
}
