import { NextResponse } from "next/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import { db } from "@/lib/db";
import { DEFAULT_ORG_ID, DEFAULT_USER_ID } from "@/lib/constants";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { getOrCreateInboxList, nextCardOrder } from "@/lib/email-inbox";
import {
  parseInboundEmail,
  ParsedInboundAttachment,
} from "@/lib/parse-inbound";

// Match the per-file cap used by card attachments.
const MAX_FILE_BYTES = 10 * 1024 * 1024;

/**
 * POST /api/inbound-email
 *
 * Webhook for an inbound-email provider (e.g. CloudMailin). Each forwarded
 * email becomes a card on the "Email Inbox" board, with its attachments saved
 * to Cloudinary. Deduplicated by Message-ID so provider retries are no-ops.
 *
 * Auth: requires the INBOUND_EMAIL_SECRET, supplied either as `?secret=` or an
 * `Authorization: Bearer <secret>` header. This is machine-to-machine; there is
 * no user session.
 */
export async function POST(request: Request) {
  // --- 1. Authenticate the webhook ----------------------------------------
  const secret = process.env.INBOUND_EMAIL_SECRET;
  if (!secret) {
    console.error("[INBOUND_EMAIL] INBOUND_EMAIL_SECRET is not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const provided =
    url.searchParams.get("secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";

  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // --- 2. Read the payload (multipart or JSON) --------------------------
    const fields: Record<string, string> = {};
    const attachments: ParsedInboundAttachment[] = [];
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      for (const [k, v] of Object.entries(body)) {
        if (typeof v === "string") fields[k] = v;
      }
      // JSON providers typically base64-encode attachments.
      const jsonAtts = (body as any).attachments;
      if (Array.isArray(jsonAtts)) {
        for (const a of jsonAtts) {
          if (a?.content && a?.file_name) {
            attachments.push({
              filename: a.file_name,
              buffer: Buffer.from(a.content, "base64"),
            });
          }
        }
      }
    } else {
      const form = await request.formData();
      for (const [key, value] of Array.from(form.entries())) {
        if (typeof value === "string") {
          fields[key] = value;
        } else if (value instanceof File) {
          if (value.size > 0 && value.size <= MAX_FILE_BYTES) {
            attachments.push({
              filename: value.name || "attachment",
              buffer: Buffer.from(await value.arrayBuffer()),
            });
          } else if (value.size > MAX_FILE_BYTES) {
            console.warn(
              `[INBOUND_EMAIL] Skipping oversized attachment ${value.name}`
            );
          }
        }
      }
    }

    const email = parseInboundEmail(fields, attachments);

    // --- 3. Dedupe by Message-ID -----------------------------------------
    const existing = await db.inboundEmail.findUnique({
      where: { messageId: email.messageId },
    });
    if (existing) {
      return NextResponse.json({ skipped: true, cardId: existing.cardId });
    }

    // --- 4. Create the card in the Inbox list ----------------------------
    const { list } = await getOrCreateInboxList();
    const order = await nextCardOrder(list.id);

    const description = email.bodyText
      ? `From: ${email.fromEmail}\n\n${email.bodyText}`
      : `From: ${email.fromEmail}`;

    const card = await db.card.create({
      data: {
        title: email.subject,
        description,
        listId: list.id,
        order,
      },
    });

    // --- 5. Upload attachments (best-effort; one bad file != total fail) --
    let uploaded = 0;
    if (attachments.length > 0 && isCloudinaryConfigured()) {
      for (const att of attachments) {
        try {
          const result = await uploadToCloudinary(att.buffer, att.filename);
          await db.attachment.create({
            data: {
              cardId: card.id,
              name: att.filename,
              url: result.url,
              publicId: result.publicId,
              bytes: result.bytes,
              format: result.format,
            },
          });
          uploaded += 1;
        } catch (err) {
          console.error(
            `[INBOUND_EMAIL] Failed to upload attachment ${att.filename}:`,
            err
          );
        }
      }
    }

    // --- 6. Audit log + dedupe record ------------------------------------
    await db.auditLog.create({
      data: {
        orgId: DEFAULT_ORG_ID,
        entityId: card.id,
        entityTitle: card.title,
        entityType: ENTITY_TYPE.CARD,
        action: ACTION.CREATE,
        userId: DEFAULT_USER_ID,
        userImage: "",
        userName: email.fromEmail || "Email Import",
      },
    });

    await db.inboundEmail.create({
      data: {
        messageId: email.messageId,
        fromEmail: email.fromEmail,
        subject: email.subject,
        cardId: card.id,
      },
    });

    return NextResponse.json({
      success: true,
      cardId: card.id,
      attachments: uploaded,
    });
  } catch (error) {
    // Return 5xx so the provider retries transient failures (e.g. DB down).
    console.error("[INBOUND_EMAIL] Error:", error);
    return NextResponse.json(
      { error: "Failed to process email" },
      { status: 500 }
    );
  }
}
