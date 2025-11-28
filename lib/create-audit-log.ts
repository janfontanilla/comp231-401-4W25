import { ACTION, ENTITY_TYPE } from "@prisma/client";

import { db } from "@/lib/db";

interface Props {
  entityId: string;
  entityType: ENTITY_TYPE;
  entityTitle: string;
  action: ACTION;
}

import { DEFAULT_ORG_ID, DEFAULT_USER_ID } from "./constants";

// Default values for guest user
const DEFAULT_USER_NAME = "Guest User";
const DEFAULT_USER_IMAGE = "";

export const createAuditLog = async (props: Props) => {
  const userId = DEFAULT_USER_ID; // Using default guest user ID

  try {
    const { entityId, entityType, entityTitle, action } = props;

    await db.auditLog.create({
      data: {
        orgId: DEFAULT_ORG_ID,
        entityId,
        entityType,
        entityTitle,
        action,
        userId: DEFAULT_USER_ID,
        userImage: DEFAULT_USER_IMAGE,
        userName: DEFAULT_USER_NAME,
      },
    });
  } catch (error) {
    console.log("[AUDIT_LOG_ERROR]", error);
  }
};
