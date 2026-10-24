import express from "express";
import {
  signUp,
  signIn,
  signOut,
  authMe,
} from "../controllers/auth.controller.js";
const authRouter = express.Router();
authRouter.post("/signup", signUp);
authRouter.post("/signIn", signIn);
authRouter.post("/signOut", signOut);
authRouter.get("/authMe", authMe);
export default authRouter;
