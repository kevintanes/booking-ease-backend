import express from "express";
import { getDashboardStats } from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));
router.get("/dashboard-stats", getDashboardStats);

export default router;
