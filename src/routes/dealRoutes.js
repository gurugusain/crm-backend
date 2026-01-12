import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { authorize } from "../middleware/authorize.js";
import { PERMISSIONS } from "../config/permissions.js";
import { createDeal, listDeals , getDealById, updateDeal } from "../controllers/dealController.js";

const router = Router();

router.get("/:id", requireAuth, authorize(PERMISSIONS.DEAL_READ), getDealById);


router.post("/", requireAuth, authorize(PERMISSIONS.DEAL_CREATE), createDeal);
router.get("/", requireAuth, authorize(PERMISSIONS.DEAL_READ), listDeals);
router.patch("/:id", requireAuth, authorize(PERMISSIONS.DEAL_UPDATE), updateDeal);   // ✅ for frontend PATCH
router.put("/:id", requireAuth, authorize(PERMISSIONS.DEAL_UPDATE), updateDeal);     // ✅ optional fallback


export default router;
