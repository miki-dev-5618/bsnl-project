// src/routes/user.routes.ts

import { Router } from "express";
import { listUsers, createUser, updateUser, deleteUser } from "../controllers/user.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", listUsers);
router.post("/", validate(createUserSchema), createUser);
router.put("/:id", validate(updateUserSchema), updateUser);
router.delete("/:id", deleteUser);

export default router;
