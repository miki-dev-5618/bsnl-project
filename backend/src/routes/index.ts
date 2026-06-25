// src/routes/index.ts

import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import smscRoutes from "./smsc.routes";
import poiRoutes from "./poi.routes";
import subscriberRoutes from "./subscriber.routes";
import auditRoutes from "./audit.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/smscs", smscRoutes);
router.use("/pois", poiRoutes);
router.use("/subscribers", subscriberRoutes);
router.use("/audit", auditRoutes);

export default router;
