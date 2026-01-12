import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { authorize } from "../middleware/authorize.js";
import { PERMISSIONS } from "../config/permissions.js";

const router = Router();

router.get(
  "/secure-leads",
  requireAuth,
  authorize(PERMISSIONS.LEAD_READ),
  (req, res) => {
    res.json({
      message: "You can read leads",
      user: req.user,
    });
  }
);

export default router;
