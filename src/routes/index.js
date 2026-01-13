import { Router } from "express";

import authRoutes from "./authRoutes.js";
import refreshRoutes from "./refreshRoutes.js";
import logoutRoutes from "./logoutRoutes.js";

import leadRoutes from "./leadRoutes.js";
import accountRoutes from "./accountRoutes.js";
import dealRoutes from "./dealRoutes.js";
import pipelineRoutes from "./pipelinesRoutes.js";
import userRoutes from "./userRoutes.js";


const router = Router();

// Auth
router.use("/auth", authRoutes);
router.use("/auth", refreshRoutes);
router.use("/auth", logoutRoutes);

// CRM modules
router.use("/leads", leadRoutes);
router.use("/accounts", accountRoutes);
router.use("/deals", dealRoutes);

router.use("/users", userRoutes);

// Dashboards
router.use("/pipeline", pipelineRoutes);

export default router;
