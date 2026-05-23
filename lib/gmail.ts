import { google } from "googleapis";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

function createOAuth2Client(accessToken: string, refreshToken?: string) {
  const client = new google.auth.OAuth2(
    env.googleClientId,
    env.googleClientSecret
  );
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return client;
}

export interface ParsedEmail {
  from: string;
  subject: string;
  body: string;
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

export async function fetchGmailMessage(
  messageId: string,
  accessToken: string,
  refreshToken?: string
): Promise<ParsedEmail> {
  const auth = createOAuth2Client(accessToken, refreshToken);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const msg = res.data;
  const headers = msg.payload?.headers ?? [];

  return {
    messageId,
    from: getHeader(headers, "From"),
    subject: getHeader(headers, "Subject"),
    date: getHeader(headers, "Date"),
    body: extractTextBody(msg.payload),
  };
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

  const auth = createOAuth2Client(accessToken, refreshToken);
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
  refreshToken?: string
): Promise<string[]> {
  const auth = createOAuth2Client(accessToken, refreshToken);
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
