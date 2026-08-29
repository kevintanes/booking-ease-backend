import express from "express";
import {
  createBooking,
  getBookingById,
  cancelBookingById,
  getAllBookings,
  getBookingStats,
} from "../controllers/booking.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.post(`/`, createBooking);
router.get(`/`, getAllBookings);
router.get(`/stats`, getBookingStats);
router.get(`/:id`, getBookingById);
router.patch(`/:id/cancel`, cancelBookingById);

export default router;
