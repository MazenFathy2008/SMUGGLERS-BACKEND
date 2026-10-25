import { Server } from "socket.io";
import { FRONTEND_URL } from "../config/env.js";
import verifyToken from "./verifiytoke.js";
import sendOrders from "./messages/sendOrders.js";

export const setUpsocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: FRONTEND_URL,
      credentials: true,
    },
  });
  io.use(verifyToken);
  io.on("connection", async (socket) => {
    if (socket.data.user) {
      socket.join("lobby");
      await sendOrders(socket);
      console.log(`Socket ${socket.id} joined the lobby`);
    }
    socket.on("disconnect", () => {
      console.log("disconnected");
    });
  });
  return io;
};
