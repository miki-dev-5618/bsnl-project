// src/schemas/user.schema.ts

import { z } from "zod";
import { Role } from "../types/enums";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([Role.ADMIN, Role.REGIONAL]),
  region: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum([Role.ADMIN, Role.REGIONAL]).optional(),
  region: z.string().nullable().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
