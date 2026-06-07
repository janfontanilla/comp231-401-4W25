/**
 * Pure helpers for normalizing an inbound-email webhook payload into a shape
 * the route can act on. Kept free of I/O (no DB, no network, no FormData) so it
 * is easy to unit-test.
 *
 * Different providers (CloudMailin, SendGrid, Postmark, ...) name fields
 * slightly differently, so we look the value up under several common keys.
 */

export interface ParsedInboundAttachment {
  filename: string;
  buffer: Buffer;
}

export interface ParsedInboundEmail {
  messageId: string;
  fromEmail: string;
  subject: string;
  bodyText: string;
  attachments: ParsedInboundAttachment[];
}

/** Max characters of body text stored on the card description. */
export const MAX_BODY_CHARS = 5000;

/** Return the first non-empty value among the given keys (case-insensitive). */
function pick(fields: Record<string, string>, keys: string[]): string {
  // Build a lowercase lookup once.
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    lower[k.toLowerCase()] = v;
  }
  for (const key of keys) {
    const v = lower[key.toLowerCase()];
    if (v && v.trim()) return v.trim();
  }
  return "";
}

/**
 * Extract a bare email address from a "Name <addr@x>" header value.
 */
export function extractEmailAddress(raw: string): string {
  if (!raw) return "";
  const match = raw.match(/<([^>]+)>/);
  const addr = (match ? match[1] : raw).trim();
  return addr.toLowerCase();
}

/**
 * Pull a Message-ID out of either a dedicated field or a raw headers blob.
 * Falls back to a synthetic id (from + subject) so dedupe still works when the
 * provider doesn't surface Message-ID.
 */
export function extractMessageId(
  fields: Record<string, string>,
  fromEmail: string,
  subject: string
): string {
  const direct = pick(fields, [
    "message-id",
    "messageid",
    "headers[message-id]",
    "message_id",
  ]);
  if (direct) return direct.replace(/[<>]/g, "").trim();

  const headers = pick(fields, ["headers", "raw_headers", "rawHeaders"]);
  if (headers) {
    const m = headers.match(/message-id:\s*<?([^>\r\n]+)>?/i);
    if (m) return m[1].trim();
  }

  // Last resort: deterministic synthetic id so retries of the same email dedupe.
  return `synthetic:${fromEmail}:${subject}`.slice(0, 191);
}

/** Strip HTML tags to plain text as a fallback when no plain body is provided. */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|br|li|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Normalize webhook string fields + file attachments into a ParsedInboundEmail.
 */
export function parseInboundEmail(
  fields: Record<string, string>,
  attachments: ParsedInboundAttachment[]
): ParsedInboundEmail {
  const fromRaw = pick(fields, [
    "from",
    "sender",
    "envelope[from]",
    "fromfull",
    "From",
  ]);
  const fromEmail = extractEmailAddress(fromRaw);

  const subject = pick(fields, ["subject", "Subject"]) || "(no subject)";

  const plain = pick(fields, ["plain", "text", "body-plain", "TextBody"]);
  const html = pick(fields, ["html", "body-html", "HtmlBody"]);
  const bodyText = (plain || (html ? htmlToText(html) : "")).slice(
    0,
    MAX_BODY_CHARS
  );

  const messageId = extractMessageId(fields, fromEmail, subject);

  return {
    messageId,
    fromEmail,
    subject: subject.slice(0, 255),
    bodyText,
    attachments,
  };
}
