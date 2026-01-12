import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

import {
  listDealNotes,
  createDealNote,
  deleteDealNote,
} from "../controllers/dealNotes.controller.js";

const router = Router();

/**
 * Mounted in app.js at: app.use("/api/v1", dealNotesRoutes)
 * Final endpoints:
 * GET    /api/v1/deals/:dealId/notes
 * POST   /api/v1/deals/:dealId/notes
 * DELETE /api/v1/deals/:dealId/notes/:noteId
 */

// ✅ Any authenticated user can view/add/delete notes
router.get("/deals/:dealId/notes", requireAuth, listDealNotes);
router.post("/deals/:dealId/notes", requireAuth, createDealNote);
router.delete("/deals/:dealId/notes/:noteId", requireAuth, deleteDealNote);

export default router;
