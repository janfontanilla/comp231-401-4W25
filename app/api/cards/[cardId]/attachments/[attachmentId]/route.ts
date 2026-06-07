import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";

/**
 * DELETE /api/cards/[cardId]/attachments/[attachmentId]
 * Remove the file from Cloudinary, then delete its database row.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { cardId: string; attachmentId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attachment = await db.attachment.findFirst({
      where: { id: params.attachmentId, cardId: params.cardId },
    });
    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    // Remove from Cloudinary first; if that fails we still drop the row so
    // the user isn't stuck with a dead entry.
    try {
      await deleteFromCloudinary(attachment.publicId);
    } catch (error) {
      console.error("[ATTACHMENT_DELETE_CLOUDINARY]", error);
    }

    await db.attachment.delete({ where: { id: attachment.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ATTACHMENT_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}
