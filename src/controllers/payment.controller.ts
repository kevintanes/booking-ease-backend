import type { Request, Response } from "express";
import { successResponse } from "../helper/response.js";
import { makePayment } from "../services/payment.service.js";
import type { AuthenticatedRequest } from "../types/express.js";

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
