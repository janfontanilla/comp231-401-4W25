"use server";

import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";
import { DEFAULT_ORG_ID } from "@/lib/constants";

import { AssignTask } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { cardId, assignedToId, boardId } = data;

  try {
    // Verify card exists and belongs to the organization
    const card = await db.card.findUnique({
      where: { id: cardId },
      include: {
        list: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!card) {
      return {
        error: "Card not found",
      };
    }

    if (card.list.board.orgId !== DEFAULT_ORG_ID) {
      return {
        error: "Unauthorized",
      };
    }

    // Validate assigned user if provided
    if (assignedToId) {
      const user = await db.user.findUnique({
        where: { id: assignedToId },
      });
      if (!user) {
        return {
          error: "Assigned user not found",
        };
      }
    }

    // Update card assignment
    const updatedCard = await db.card.update({
      where: { id: cardId },
      data: {
        assignedToId: assignedToId || null,
      },
      include: {
        assignedTo: true,
      },
    });

    await createAuditLog({
      entityId: card.id,
      entityTitle: card.title,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.UPDATE,
    });

    revalidatePath(`/board/${boardId}`);
    return { data: updatedCard };
  } catch (error) {
    return {
      error: "Failed to assign task.",
    };
  }
};

export const assignTask = createSafeAction(AssignTask, handler);

