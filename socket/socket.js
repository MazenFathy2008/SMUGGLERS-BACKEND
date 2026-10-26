import { Server } from "socket.io";
import { FRONTEND_URL } from "../config/env.js";
import verifyToken from "./verifiytoke.js";
import sendOrders from "./messages/sendOrders.js";
import collectOrder from "./events/collector/collectOrder.js";
import closeOrder from "./events/collector/closeOrder.js";
import joinOrder from "./events/joinOrder.js";
import updateOrder from "./events/updateOrder.js";
import cancelOrder from "./events/collector/cancelOrder.js";
import getOrder from "./events/getOrder.js";
import getMyOrders from "./events/getMyOrders.js";
import leaveOrder from "./events/leaveOrder.js";

let ioInstance = null;

export const getIO = () => ioInstance;

export const setUpsocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: FRONTEND_URL,
      credentials: true,
    },
  });

  const io = ioInstance;

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
      console.log(
        `Socket ${socket.id} (${socket.data.user?.name || "User"}) joined the lobby`,
      );
/////////////////////////////
      socket.on("joinOrder", async (data, callback) => {
        await joinOrder(io, socket, data, callback);
      });
      // Update Order
      socket.on("updateMyOrder", async (data, callback) => {
        await updateOrder(io, socket, data, callback);
      });
      // Cancel Order
      socket.on("cancelMyOrder", async (data, callback) => {
        await cancelOrder(io, socket, data, callback);
      });

      // --- Order Retrieval & Rooms ---
      // Get single order details and join room
      socket.on("getOrder", async (data, callback) => {
        await getOrder(io, socket, data, callback);
      });
      // Get current user's participated / created orders
      socket.on("getMyOrders", async (data, callback) => {
        await getMyOrders(io, socket, data, callback);
      });

      // Refresh active orders in lobby
      socket.on("getActiveOrders", async (data, callback) => {
        const cb = typeof data === "function" ? data : callback;
        await sendOrders(socket, cb);
      });

      // Leave order room
      socket.on("leaveOrder", async (data, callback) => {
        await leaveOrder(io, socket, data, callback);
      });
    });
    return io;
  });
};
