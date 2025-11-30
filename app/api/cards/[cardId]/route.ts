import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { DEFAULT_ORG_ID } from "@/lib/constants";

export async function GET(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const card = await db.card.findUnique({
      where: {
        id: params.cardId,
        list: {
          board: {
            orgId: DEFAULT_ORG_ID,
          },
        },
      },
      include: {
        list: {
          select: {
            title: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
