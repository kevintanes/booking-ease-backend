import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { getJwtSecret } from "../helper/jwt.helper.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    if (typeof decoded === "string" || typeof decoded.userId !== "string") {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json();
  }
};
