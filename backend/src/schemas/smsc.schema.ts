// src/schemas/smsc.schema.ts

import { z } from "zod";
import { SmscStatusType } from "../types/enums";

export const updateSmscStatusSchema = z.object({
  status: z.enum([SmscStatusType.UP, SmscStatusType.DOWN, SmscStatusType.DEGRADED]),
  note: z.string().max(500).optional(),
});

export type UpdateSmscStatusInput = z.infer<typeof updateSmscStatusSchema>;
