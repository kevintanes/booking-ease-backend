import express from "express";
import {
  createService,
  deleteService,
  getAdminBookings,
  getAllServicesAdmin,
  getAllUsers,
  getDashboardStats,
  updateBookingStatus,
  updateService,
} from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard-stats", getDashboardStats);
router.get("/bookings", getAdminBookings);
router.patch("/bookings/:id/status", updateBookingStatus);
router.get("/services", getAllServicesAdmin);
router.post("/services", createService);
router.patch("/services/:id", updateService);
router.delete("/services/:id", deleteService);
router.get("/users", getAllUsers);

export default router;
