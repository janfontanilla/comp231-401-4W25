import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { DEFAULT_ORG_ID } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import {
  uploadToCloudinary,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

// Max upload size (10 MB) — keeps us well within free-tier limits
const MAX_FILE_BYTES = 10 * 1024 * 1024;

/**
 * GET /api/cards/[cardId]/attachments
 * List all attachments for a card.
 */
export async function GET(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const attachments = await db.attachment.findMany({
      where: { cardId: params.cardId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(attachments);
  } catch (error) {
    console.error("[ATTACHMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * POST /api/cards/[cardId]/attachments
 * Upload a file (multipart/form-data, field name "file") to Cloudinary
 * and store its metadata against the card.
 */
export async function POST(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "File uploads are not configured on this server" },
        { status: 503 }
      );
    }

    // Verify the card exists and belongs to the org
    const card = await db.card.findFirst({
      where: {
        id: params.cardId,
        list: { board: { orgId: DEFAULT_ORG_ID } },
      },
    });
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File is too large (max 10 MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToCloudinary(buffer, file.name);

    const attachment = await db.attachment.create({
      data: {
        cardId: card.id,
        name: file.name,
        url: uploaded.url,
        publicId: uploaded.publicId,
        bytes: uploaded.bytes,
        format: uploaded.format,
      },
    });

    await createAuditLog({
      entityId: card.id,
      entityType: ENTITY_TYPE.CARD,
      entityTitle: card.title,
      action: ACTION.UPDATE,
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("[ATTACHMENTS_POST]", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
