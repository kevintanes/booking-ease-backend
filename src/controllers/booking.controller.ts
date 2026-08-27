import type { Request, Response } from "express";
import { successResponse } from "../helper/response.js";
import {
  addBooking,
  cancelBooking,
  getBooking,
} from "../services/booking.service.js";
import type { AuthenticatedRequest } from "../types/express.js";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { serviceId, timeSlotId, bookingDate, notes } = req.body;
    const { user } = req as AuthenticatedRequest;

    const result = await addBooking(
      {
        bookingDate,
        serviceId,
        timeSlotId,
        notes,
      },
      user.id,
    );

    return successResponse(res, 201, "Success", result);
  } catch (error) {
    throw error;
  }
};

export const getBookingById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { user } = req as AuthenticatedRequest;

    const result = await getBooking(id, user.id);

    return successResponse(res, 200, "Success", result);
  } catch (error) {
    throw error;
  }
};
export const cancelBookingById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { user } = req as AuthenticatedRequest;

    const result = await cancelBooking(id, user.id);

    return successResponse(res, 200, "Success", result);
  } catch (error) {
    throw error;
  }
};
