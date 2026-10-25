import { Server } from "socket.io";
import { FRONTEND_URL } from "../config/env.js";
let io;
export const setUpsocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: FRONTEND_URL,
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);
    socket.on("disconnect", () => {
      console.log("disconnected");
    });
  });
};
export default io;
