import express from "express";
import { FRONTEND_URL, PORT } from "./config/env.js";
import { createServer } from "http";
import dns from "node:dns";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import errorsMiddleware from "./middleware/error.middleware.js";
import authRouter from "./router/auth.route.js";
import { setUpsocket } from "./socket/socket.js";
dns.setServers(["8.8.8.8"]);
const app = express();
const server = createServer(app);
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRouter);
app.use(errorsMiddleware);
export const io = setUpsocket(server);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log(`database connection error: ${err.message}`);
    return;
  }
};
startServer();
