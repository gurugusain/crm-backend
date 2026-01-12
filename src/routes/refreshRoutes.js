import { Router } from "express";
import { refresh } from "../controllers/refreshController.js";

const router = Router();

router.post("/refresh", refresh);

export default router;
