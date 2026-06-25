// src/routes/smsc.routes.ts

import { Router } from "express";
import { listSmscs, updateSmscStatus, getSmscHistory } from "../controllers/smsc.controller";
import { listPois, createPoi } from "../controllers/poi.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateSmscStatusSchema } from "../schemas/smsc.schema";
import { createPoiSchema } from "../schemas/poi.schema";

const router = Router();

router.use(requireAuth);

router.get("/", listSmscs);
router.put("/:id/status", validate(updateSmscStatusSchema), updateSmscStatus);
router.get("/:id/history", getSmscHistory);

// POI sub-routes under SMSC
router.get("/:id/pois", listPois);
router.post("/:id/pois", validate(createPoiSchema), createPoi);

export default router;
