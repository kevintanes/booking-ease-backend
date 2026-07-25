import type { Response } from "express";

export const successResponse = (
  res: Response,
  status: number,
  message: string,
  data: unknown,
) => {
  res.status(status || 200).json({
    status: message,
    data: data,
  });
};
