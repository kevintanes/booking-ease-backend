import express from "express";
import {
  createBooking,
  getBookingById,
  cancelBookingById,
} from "../controllers/booking.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.post(`/`, createBooking);
router.get(`/:id`, getBookingById);
router.patch(`/:id/cancel`, cancelBookingById);

export default router;
