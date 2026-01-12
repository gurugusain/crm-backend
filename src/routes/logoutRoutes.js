import { Router } from "express";
import { logoutCurrent, logoutAll } from "../controllers/logoutController.js";

const router = Router();

router.post("/logout", logoutCurrent);
router.post("/logout-all", logoutAll);

export default router;
