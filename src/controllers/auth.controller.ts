import type { Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth.service.js";
import { successResponse } from "../helper/response.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password, phone } = req.body;

    const { newUser, token } = await registerUser({
      email,
      name,
      password,
      phone,
    });

    return successResponse(res, 201, "Register Success", {
      user: newUser,
      token: token,
    });
  } catch (error) {
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    return successResponse(res, 200, "Login Success", result);
  } catch (error) {
    throw error;
  }
};
