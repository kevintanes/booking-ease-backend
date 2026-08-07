import type { Request, Response } from "express";
import { successResponse } from "../helper/response.js";
import { getService, getServices } from "../services/service.service.js";

export const getAllService = async (req: Request, res: Response) => {
  try {
    const result = await getServices();

    return successResponse(res, 200, "Success", result);
  } catch (error) {
    throw error;
  }
};

export const getServiceById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const result = await getService(id);

    return successResponse(res, 200, "Success", result);
  } catch (error) {
    throw error;
  }
};
