import express from "express";
import { rateLimit } from "express-rate-limit";
import {
  signUp,
  signIn,
  signOut,
  authMe,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller.js";
const authRouter = express.Router();
const passwordRecoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "TOO_MANY_PASSWORD_RECOVERY_ATTEMPTS",
    message: "محاولات كثيرة. انتظر 15 دقيقة ثم حاول مرة أخرى.",
  },
});
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "TOO_MANY_PASSWORD_RESET_ATTEMPTS",
    message: "محاولات كثيرة. انتظر 15 دقيقة ثم حاول مرة أخرى.",
  },
});

authRouter.post("/signup", signUp);
authRouter.post("/signIn", signIn);
authRouter.post("/signOut", signOut);
authRouter.get("/authMe", authMe);
authRouter.post("/forgotPassword", passwordRecoveryLimiter, requestPasswordReset);
authRouter.post("/resetPassword", passwordResetLimiter, resetPassword);
export default authRouter;
