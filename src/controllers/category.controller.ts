import type { Request, Response } from "express";

import { successResponse } from "../helper/response.js";
import { getCategories } from "../services/category.service.js";

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await getCategories();

    return successResponse(res, 200, "Success", result);
  } catch (error) {
    throw error;
  }
};
