import type { Request } from "express";
import type { User } from "@prisma/client";

type AuthUser = Pick<User, "id" | "email" | "name" | "role" | "avatar">;

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

export {};
