import type {
  Request,
  Response,
  ErrorRequestHandler,
  NextFunction,
} from "express";

interface AppError {
  status?: number;
  message?: string;
}

const errorHandler: ErrorRequestHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
