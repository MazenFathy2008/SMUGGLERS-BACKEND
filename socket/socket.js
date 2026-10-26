import { Server } from "socket.io";
import { FRONTEND_URL } from "../config/env.js";
import verifyToken from "./verifiytoke.js";
import sendOrders from "./messages/sendOrders.js";
import collectOrder from "./events/collectOrder.js";
import joinOrder from "./events/joinOrder.js";
import updateOrder from "./events/updateOrder.js";
import cancelOrder from "./events/cancelOrder.js";
import getOrder from "./events/getOrder.js";
import getMyOrders from "./events/getMyOrders.js";
import updateOrderStatus from "./events/updateOrderStatus.js";
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
    console.log(
      `Socket ${socket.id} (${socket.data.user?.name || "User"}) joined the lobby`
    );

    // --- Order Creation (Collector/Admin) ---
    socket.on("collectOrder", async (data, callback) => {
      await collectOrder(io, socket, data, callback);
    });
    socket.on("createGroupOrder", async (data, callback) => {
      await collectOrder(io, socket, data, callback);
    });

    // --- Participant Actions ---
    // Join Order
    socket.on("joinOrder", async (data, callback) => {
      await joinOrder(io, socket, data, callback);
    });
    socket.on("joinGroupOrder", async (data, callback) => {
      await joinOrder(io, socket, data, callback);
    });

    // Update Order
    socket.on("updateOrder", async (data, callback) => {
      await updateOrder(io, socket, data, callback);
    });
    socket.on("updateMyOrder", async (data, callback) => {
      await updateOrder(io, socket, data, callback);
    });

    // Cancel Order
    socket.on("cancelOrder", async (data, callback) => {
      await cancelOrder(io, socket, data, callback);
    });
    socket.on("cancelMyOrder", async (data, callback) => {
      await cancelOrder(io, socket, data, callback);
    });

    // --- Order Retrieval & Rooms ---
    // Get single order details and join room
    socket.on("getOrder", async (data, callback) => {
      await getOrder(io, socket, data, callback);
    });
    socket.on("getOrderById", async (data, callback) => {
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
    socket.on("leaveOrderRoom", async (data, callback) => {
      await leaveOrder(io, socket, data, callback);
    });

    // --- Order Status Management (Collector/Admin) ---
    socket.on("updateOrderStatus", async (data, callback) => {
      await updateOrderStatus(io, socket, data, callback);
    });
    socket.on("closeOrder", async (data, callback) => {
      const payload =
        typeof data === "object"
          ? { ...data, status: "closed" }
          : { orderId: data, status: "closed" };
      await updateOrderStatus(io, socket, payload, callback);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket ${socket.id} disconnected: ${reason}`);
    });
  });

  return io;
};
