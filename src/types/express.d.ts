import type { User } from "@prisma/client";
import type { Request } from "express";

type AuthUser = Pick<User, "id" | "email" | "name" | "role" | "avatar">;

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

export {};
