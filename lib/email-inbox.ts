import { db } from "@/lib/db";
import { DEFAULT_ORG_ID } from "@/lib/constants";
import { defaultImages } from "@/constants/images";

const INBOX_BOARD_TITLE = "Email Inbox";
const INBOX_LIST_TITLE = "Inbox";

/**
 * Find (or lazily create) the single board + list that imported emails land in.
 * Returns the Inbox List, which the inbound-email webhook adds cards to.
 *
 * The board needs Unsplash-style image fields; we reuse the first bundled
 * default image so no Unsplash API call is required.
 */
export async function getOrCreateInboxList() {
  let board = await db.board.findFirst({
    where: { orgId: DEFAULT_ORG_ID, title: INBOX_BOARD_TITLE },
  });

  if (!board) {
    const img = defaultImages[0];
    board = await db.board.create({
      data: {
        title: INBOX_BOARD_TITLE,
        orgId: DEFAULT_ORG_ID,
        imageId: img.id,
        imageThumbUrl: img.urls.thumb,
        imageFullUrl: img.urls.full,
        imageUserName: img.user?.name ?? "Unsplash",
        imageLinkHTML: img.links.html,
      },
    });
  }

  let list = await db.list.findFirst({
    where: { boardId: board.id, title: INBOX_LIST_TITLE },
  });

  if (!list) {
    list = await db.list.create({
      data: {
        title: INBOX_LIST_TITLE,
        boardId: board.id,
        order: 0,
      },
    });
  }

  return { board, list };
}

/** Next card order within a list (mirrors actions/create-card). */
export async function nextCardOrder(listId: string): Promise<number> {
  const lastCard = await db.card.findFirst({
    where: { listId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return lastCard ? lastCard.order + 1 : 1;
}
