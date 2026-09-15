import type { User } from "@prisma/client";

type AuthUser = Pick<User, "id" | "email" | "name" | "role" | "avatar">;

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

export {};
