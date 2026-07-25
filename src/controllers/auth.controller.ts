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

    return successResponse(res, 201, "Success", {
      user: newUser,
      token: token,
    });
  } catch (error) {
    console.log(error);
    throw {
      status: 500,
      message: error instanceof Error ? error.message : "Registraion failed",
    };
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    return successResponse(res, 200, "Success", result);
  } catch (error) {
    console.log(error);
    throw {
      status: 500,
      message: error instanceof Error ? error.message : "Login failed",
    };
  }
};
