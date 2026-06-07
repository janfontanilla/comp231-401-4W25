import { Card, List, Attachment } from "@prisma/client";

export type ListWithCards = List & { cards: Card[] };

export type CardWithList = Card & {
  list: List;
  attachments?: Attachment[];
  assignedTo?: { id: string; name: string; email: string } | null;
};
