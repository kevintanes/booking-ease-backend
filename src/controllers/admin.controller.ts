import type { NextFunction, Request, Response } from "express";
import { getAdminDashboard } from "../services/admin.service.js";
import { successResponse } from "../helper/response.js";

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
