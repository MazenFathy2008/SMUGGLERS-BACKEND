import Orders from "../../../model/orders.model.js";
export default async function collectOrder(socket, data) {
  try {
    const user = socket.data.user;
    if (user.role != "admin") {
      socket.emit("socketError", {
        message: "Only admins can create group orders",
      });
      return;
    }
    try {
      const order = await Orders.create({
        ...data,
        collector: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          roomNumber: user.roomNumber,
        },
      });
      await socket.join(order._id.toString());
      socket.emit("roomCreated", {
        data: order,
      });
      socket.to("lobby").emit("newActiveOrder", order);
    } catch {
      socket.emit("socketError", {
        message: "Missing data or wrong format please check your data",
      });
    }
  } catch {
    socket.emit("socketError", {
      message: "something went wrong try again later",
    });
  }
}
