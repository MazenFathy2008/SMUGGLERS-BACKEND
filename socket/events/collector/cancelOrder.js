import Orders from "../../../model/orders.model.js";
import { io } from "../../../server.js";
export default async function cancelOrder(socket, data) {
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

    if (order.status !== "open" && order.status !== "closed") {
      socket.emit("socketError", {
        message: "Only open or closed orders can be cancelled",
      });
      return;
    }
    order.status = "cancelled";
    await order.save();
    socket.emit("orderCancelled", order);
    const { participants, ...orderWithoutParticipants } = order.toObject();
    socket.to(order._id).emit("orderCancelled", orderWithoutParticipants);
    io.to("lobby").emit("orderCancelled", orderWithoutParticipants);
  } catch {
    socket.emit("socketError", {
      message: "something went wrong try again later",
    });
  }
}
