// src/routes/subscriber.routes.ts

import { Router } from "express";
import {
  listSubscribers,
  createSubscriber,
  deleteSubscriber,
} from "../controllers/subscriber.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createSubscriberSchema } from "../schemas/subscriber.schema";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", listSubscribers);
router.post("/", validate(createSubscriberSchema), createSubscriber);
router.delete("/:id", deleteSubscriber);

export default router;
