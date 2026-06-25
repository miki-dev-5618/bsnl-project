// src/schemas/subscriber.schema.ts

import { z } from "zod";

export const createSubscriberSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number format")
    .nullable()
    .optional(),
});

export type CreateSubscriberInput = z.infer<typeof createSubscriberSchema>;
