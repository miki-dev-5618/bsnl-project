// src/routes/audit.routes.ts

import { Router } from "express";
import { listAuditLogs } from "../controllers/audit.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", listAuditLogs);

export default router;
