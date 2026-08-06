import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { generateToken } from "../helper/jwt.helper.js";
import { AppError } from "../utils/app-error.js";

interface RegisterInput {
  email: string;
  name: string;
  password: string;
  phone?: string | null;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async (user: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(user.password, 10);

  const newUser = await prisma.user.create({
    data: {
      email: user.email,
      password: hashedPassword,
      name: user.name,
      phone: user.phone ?? null,
      role: "USER",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      phone: true,
    },
  });

  const token = generateToken(newUser.id);

  return {
    newUser,
    token,
  };
};

export const loginUser = async ({ email, password }: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken(user.id);
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token: token,
  };
};
