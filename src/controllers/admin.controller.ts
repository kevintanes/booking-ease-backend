import type { NextFunction, Request, Response } from "express";
import {
  addService,
  editService,
  getAdminDashboard,
  getAllAdminBookings,
  getUsers,
  patchBookingStatus,
  removeService,
} from "../services/admin.service.js";
import { successResponse } from "../helper/response.js";
import { BookingStatus, type Service } from "@prisma/client";
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

export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, description, price, duration, location, categoryId, slots } =
      req.body;

    if (
      !name ||
      !description ||
      !categoryId ||
      price === undefined ||
      duration === undefined
    ) {
      throw new AppError(
        "name, description, price, duration, and categoryId are required",
        400,
      );
    }

    const parsedPrice = parseFloat(price);
    const parsedDuration = parseInt(duration, 10);

    if (isNaN(parsedPrice) || isNaN(parsedDuration)) {
      throw new AppError("price and duration must be valid numbers", 400);
    }

    const result = await addService({
      name,
      description,
      price: parsedPrice,
      duration: parsedDuration,
      location,
      categoryId,
      slots,
    });

    return successResponse(res, 201, "Success", result);
  } catch (error) {
    next(error);
  }
};

export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      description,
      price,
      duration,
      location,
      categoryId,
      isActive,
      slots,
    } = req.body;

    const { id } = req.params;

    const service = {
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price: parseFloat(price) }),
      ...(duration && { duration: parseInt(duration) }),
      ...(location !== undefined && { location }),
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
    };

    const result = await editService(id as string, service, slots);

    return successResponse(res, 200, "Success", result);
  } catch (err) {
    next(err);
  }
};

export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const result = await removeService(id as string);

    return successResponse(res, 200, "Success", result);
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getUsers({
      limit,
      page,
    });

    return successResponse(res, 200, "Success", result);
  } catch (error) {
    next(error);
  }
};
