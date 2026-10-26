import Orders from "../../model/orders.model";
import { io } from "../server.js";
export default async function closeOrder(socket, data) {
  try {
    const user = socket.data.user;
    const { orderId } = data;
    const order = await Orders.findById(orderId);
    if (!order) {
      socket.emit("socketError", {
        message: "Order not found",
      });
      return;
    }
    if (
      user.role != "admin" ||
      user._id.toString() !== order.collector.id.toString()
    ) {
      socket.emit("socketError", {
        message: "Only  this order collector will be able to access it",
      });
      return;
    }

    if (order.status !== "open") {
      socket.emit("socketError", {
        message: "This order is not open",
      });
      return;
    }
    order.status = "closed";
    await order.save();
    socket.emit("orderClosed", order);
    const { participants, ...orderWithoutParticipants } = order.toObject();
    socket.to(order._id).emit("orderClosed", orderWithoutParticipants);
    io.to("lobby").emit("orderClosed", orderWithoutParticipants);
  } catch {
    socket.emit("socketError", {
      message: "something went wrong try again later",
    });
  }
}
