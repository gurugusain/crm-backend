import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  listDealTasks,
  createDealTask,
  updateDealTask,
  deleteDealTask,
} from "../controllers/dealTasks.controller.js";

const router = Router();

router.get("/deals/:dealId/tasks", requireAuth, listDealTasks);
router.post("/deals/:dealId/tasks", requireAuth, createDealTask);
router.patch("/deals/:dealId/tasks/:taskId", requireAuth, updateDealTask);
router.delete("/deals/:dealId/tasks/:taskId", requireAuth, deleteDealTask);

export default router;
