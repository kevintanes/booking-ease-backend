import type { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { successResponse } from "../helper/response.js";
import {
  handleInvoiceWebhookEvent,
  makePayment,
} from "../services/payment.service.js";
import type { AuthenticatedRequest } from "../types/express.js";
import { AppError } from "../utils/app-error.js";

export const createPayment = async (
  req: Request<{ bookingId: string }>,
  res: Response,
) => {
  try {
    const { bookingId } = req.params;
    const { user } = req as AuthenticatedRequest;

    const result = await makePayment(bookingId, user.id);

    return successResponse(res, 201, "Success", result);
  } catch (error) {
    throw error;
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const webhookToken = req.headers["x-callback-token"];
  if (webhookToken !== process.env.XENDIT_WEBHOOK_KEY) {
    throw new AppError("Invalid webhook token", 401);
  }

  await handleInvoiceWebhookEvent(req.body);

  return successResponse(res, 200, "Webhook received", null);
};
