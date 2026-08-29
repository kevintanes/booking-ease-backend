import { BookingStatus } from "@prisma/client";
import type { Request, Response } from "express";
import { successResponse } from "../helper/response.js";
import {
  addBooking,
  cancelBooking,
  getBooking,
  getBookingCountStats,
  getBookings,
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

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { status } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getBookings(user.id, {
      page,
      limit,
      status: status as BookingStatus,
    });

    return successResponse(res, 200, "Success", result);
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

export const getBookingStats = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest;

    const result = await getBookingCountStats(user.id);

    return successResponse(res, 200, "Success", result);
  } catch (error) {
    throw error;
  }
};
