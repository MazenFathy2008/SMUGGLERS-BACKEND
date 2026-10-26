import Orders from "../../model/orders.model.js";

const sendOrders = async (socket, callback) => {
  try {
    const activeOrders = await Orders.find({
      status: "open",
    }).select("-participants");
    socket.emit("activeOrders", activeOrders);
    if (typeof callback === "function") {
      callback({ success: true, activeOrders });
    }
  } catch (error) {
    socket.emit("socketError", {
      message: "Failed to load active orders",
    });
    if (typeof callback === "function") {
      callback({ success: false, message: "Failed to load active orders" });
    }
  }
};

export default sendOrders;
