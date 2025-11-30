import { z } from "zod";

export const AssignTask = z.object({
  cardId: z.string(),
  assignedToId: z.string().optional().nullable(),
  boardId: z.string(),
});

