import express from "express";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { FRONTEND_URL, PORT } from "./config/env.js";
import dns from "node:dns";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import errorsMiddleware from "./middleware/error.middleware.js";
import authRouter from "./router/auth.route.js";
import setUpWepSocket from "./websocket/websokcet.js";
dns.setServers(["8.8.8.8"]);
const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });
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
setUpWepSocket(wss);
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
      console.log(`WebSocket server ready on port ${PORT}`);
    });
  } catch (err) {
    console.log(`database connection error: ${err.message}`);
    return;
  }
};
startServer();
