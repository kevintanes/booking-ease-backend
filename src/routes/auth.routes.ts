import express from "express";
import {
  register,
  login,
  googleCallback,
  getMe,
} from "../controllers/auth.controller.js";
import passport from "passport";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(`/register`, register);
router.post(`/login`, login);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_ORIGIN}/login?error=oauth_failed`,
  }),
  googleCallback,
);
router.get("/me", authenticate, getMe);

export default router;
