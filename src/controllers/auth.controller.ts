import type { NextFunction, Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth.service.js";
import { successResponse } from "../helper/response.js";
import { generateToken } from "../helper/jwt.helper.js";
import { env } from "../config/env.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    return successResponse(res, 200, "Login Success", result);
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.redirect(`${env.CLIENT_ORIGIN}/login?error=oauth_failed`);
    }

    const token = generateToken(req.user.id);

    res.redirect(`${env.CLIENT_ORIGIN}/auth/callback?token=${token}`);
  } catch (error) {
    console.error(error);
    res.redirect(`${env.CLIENT_ORIGIN}/login?error=server_error`);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return successResponse(res, 200, "Success", { user: req.user });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
