// src/routes/auth.routes.ts

import { Router } from "express";
import { login, me } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", requireAuth, me);

export default router;
