import express from "express";
import {
  getAdminBookings,
  getDashboardStats,
  updateBookingStatus,
} from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));
router.get("/dashboard-stats", getDashboardStats);
router.get("/bookings", getAdminBookings);
router.patch("/bookings/:id/status", updateBookingStatus);

export default router;
