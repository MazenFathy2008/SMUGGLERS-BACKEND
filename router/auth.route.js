import express from "express";
import { signUp,signIn } from "../controllers/auth.controller.js";
const authRouter = express.Router();
authRouter.post("/signup", signUp);
authRouter.post("/signIn", signIn);
export default authRouter;
