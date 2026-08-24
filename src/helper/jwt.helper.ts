import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error.js";

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT_SECRET is not configured", 500);
  }
  return secret;
};

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, getJwtSecret(), {
    expiresIn: "1d",
  });
};
