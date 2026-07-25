import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface RegisterInput {
  email: string;
  name: string;
  password: string;
  phone?: string | null;
}

export const registerUser = async (user: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (existingUser) {
    throw {
      status: 400,
      message: "User Already Exists",
    };
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

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw {
      status: 500,
      message: "JWT_SECRET is not configured!",
    };
  }

  const token = jwt.sign({ userId: newUser.id }, jwtSecret, {
    expiresIn: "1d",
  });

  return {
    newUser,
    token,
  };
};
