import { Server } from "socket.io";
import { FRONTEND_URL } from "../config/env.js";
import verifyToken from "./verifiytoke.js";
import sendOrders from "./messages/sendOrders.js";
import collectOrder from "./events/collectOrder.js";
import closeOrder from "./events/closeOrder.js";
import cancelOrder from "./events/cancelORder.js";
export const setUpsocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: FRONTEND_URL,
      credentials: true,
    },
  });
  io.use(verifyToken);
  io.on("connection", async (socket) => {
    socket.join("lobby");
    await sendOrders(socket);
    console.log(`Socket ${socket.id} joined the lobby`);

    // events section (عشان اعرف اشوف في اللعبكة بنت ال##ره ده)
    socket.on("collectOrder", async (data) => {
      await collectOrder(socket, data);
    });
    socket.on("closeOrder", async (data) => {
      await closeOrder(socket, data);
    });

    socket.on("cancelOrder", async (data) => {
      await cancelOrder(socket, data);
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });
  });
  return io;
};
