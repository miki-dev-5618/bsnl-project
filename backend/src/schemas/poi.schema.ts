// src/schemas/poi.schema.ts

import { z } from "zod";
import { PoiStatus } from "../types/enums";

export const createPoiSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  status: z.enum([PoiStatus.ACTIVE, PoiStatus.BROKEN, PoiStatus.RESOLVED]).optional().default("ACTIVE"),
  note: z.string().max(500).optional(),
});

export const updatePoiSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum([PoiStatus.ACTIVE, PoiStatus.BROKEN, PoiStatus.RESOLVED]).optional(),
  note: z.string().max(500).nullable().optional(),
});

export type CreatePoiInput = z.infer<typeof createPoiSchema>;
export type UpdatePoiInput = z.infer<typeof updatePoiSchema>;
