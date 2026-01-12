import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { authorize } from "../middleware/authorize.js";
import { PERMISSIONS } from "../config/permissions.js";
import { pipelineSummary } from "../controllers/pipelineController.js";

const router = Router();

router.get(
  "/summary",
  requireAuth,
  authorize(PERMISSIONS.PIPELINE_READ),
  pipelineSummary
);

export default router;
