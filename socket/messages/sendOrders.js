import Orders from "../../model/orders.model";
const sendOrders = async (socket) => {
  try {
    const activeOrders = await Orders.find({
      status: "open",
    }).select("-participants");
    socket.emit("activeOrders", activeOrders);
  } catch (error) {
    socket.emit("socketError", {
      message: "Failed to load active orders",
    });
  }
};
export default sendOrders