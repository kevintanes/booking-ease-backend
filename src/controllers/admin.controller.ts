import type { NextFunction, Request, Response } from "express";
import {
  getAdminDashboard,
  getAllAdminBookings,
  patchBookingStatus,
} from "../services/admin.service.js";
import { successResponse } from "../helper/response.js";
import { BookingStatus } from "@prisma/client";
import { AppError } from "../utils/app-error.js";

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAdminDashboard();
    return successResponse(res, 200, "Success", result);
  } catch (error) {
    next(error);
  }
};

export const getAdminBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status, search } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAllAdminBookings({
      page,
      limit,
      search: search as string,
      status: status as BookingStatus,
    });

    return successResponse(res, 200, "Success", result);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(BookingStatus).includes(status)) {
      throw new AppError("Invalid Status", 400);
    }

    const result = await patchBookingStatus(
      id as string,
      status as BookingStatus,
    );

    return successResponse(res, 200, "Success", result);
  } catch (error) {
    next(error);
  }
};
