import { z } from "zod";
import { Card } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { AssignTask } from "./schema";

export type InputType = z.infer<typeof AssignTask>;
export type ReturnType = ActionState<InputType, Card>;

