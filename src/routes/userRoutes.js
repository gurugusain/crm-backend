import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { listUsers } from "../controllers/userController.js";

const router = Router();

// GET /api/v1/users?search=&limit=50
router.get("/", requireAuth, listUsers);

export default router;
