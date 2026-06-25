// src/routes/poi.routes.ts

import { Router } from "express";
import { updatePoi, deletePoi } from "../controllers/poi.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updatePoiSchema } from "../schemas/poi.schema";

const router = Router();

router.use(requireAuth);

router.put("/:id", validate(updatePoiSchema), updatePoi);
router.delete("/:id", deletePoi);

export default router;
