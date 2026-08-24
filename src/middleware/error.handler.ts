import type {
  Request,
  Response,
  ErrorRequestHandler,
  NextFunction,
} from "express";
import { AppError } from "../utils/app-error.js";

const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const status = err instanceof AppError ? err.status : 500;
  const message =
    err instanceof AppError ? err.message : "Internal Server Error";

  console.error(err);

  res.status(status).json({
    success: false,
    message,
  });
};

export default errorHandler;
