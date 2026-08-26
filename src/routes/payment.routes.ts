import express from "express";
import {
  createPayment,
  handleWebhook,
} from "../controllers/payment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(`/webhook`, handleWebhook);
router.post(`/:bookingId/create`, authenticate, createPayment);

export default router;
