import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { authorize } from "../middleware/authorize.js";
import { PERMISSIONS } from "../config/permissions.js";
import { createLead, listLeads } from "../controllers/leadController.js";
import { canAccessLead } from "../middleware/canAccessLead.js";
import { updateLead, deleteLead } from "../controllers/leadController.js";
import { convertLead } from "../controllers/leadConvertController.js";
import { getLeadById } from "../controllers/leadController.js";


const router = Router();

router.post(
  "/",
  requireAuth,
  authorize(PERMISSIONS.LEAD_CREATE),
  createLead
);

router.get(
  "/",
  requireAuth,
  authorize(PERMISSIONS.LEAD_READ),
  listLeads
);

// update lead
router.patch(
  "/:id",
  requireAuth,
  authorize(PERMISSIONS.LEAD_UPDATE),
  canAccessLead,
  updateLead
);

// delete lead
router.delete(
  "/:id",
  requireAuth,
  authorize(PERMISSIONS.LEAD_DELETE),
  canAccessLead,
  deleteLead
);

router.get(
  "/:id",
  requireAuth,
  authorize(PERMISSIONS.LEAD_READ),
  getLeadById
);


router.post(
  "/:id/convert",
  requireAuth,
  authorize(PERMISSIONS.LEAD_UPDATE),
  canAccessLead,
  convertLead
);
export default router;
