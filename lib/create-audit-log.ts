import { ACTION, ENTITY_TYPE } from "@prisma/client";

import { cookies } from 'next/headers';

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
  const userId = cookies().get("userId");

  try {
    const user = await db.user.findUnique({
      where: {
        id: userId?.value,
      },
    });

    const { entityId, entityType, entityTitle, action } = props;

    await db.auditLog.create({
      data: {
        orgId: DEFAULT_ORG_ID,
        entityId,
        entityType,
        entityTitle,
        action,
        userId: user?.id || DEFAULT_USER_ID,
        userImage: DEFAULT_USER_IMAGE,
        userName: user?.email || DEFAULT_USER_NAME,
      },
    });
  } catch (error) {
    console.log("[AUDIT_LOG_ERROR]", error);
  }
};
