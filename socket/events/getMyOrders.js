import Orders from "../../model/orders.model.js";

export default async function getMyOrders(io, socket, data, callback) {
  let clientSocket = socket;
  let cb = callback;

  if (typeof io?.emit !== "function" && typeof socket?.emit === "function") {
    clientSocket = io;
    cb = callback;
  }

  try {
    const user = clientSocket.data?.user;
    if (!user) {
      const res = { success: false, message: "Authentication required" };
      clientSocket.emit("socketError", res);
      if (typeof cb === "function") cb(res);
      return;
    }

    const orders = await Orders.find({
      $or: [
        { "participants.user": user._id },
        { "collector.user": user._id },
      ],
    }).sort({ createdAt: -1 });

    const res = {
      success: true,
      orders,
    };

    clientSocket.emit("myOrders", res);
    if (typeof cb === "function") cb(res);
  } catch (err) {
    const res = {
      success: false,
      message: err.message || "حدث خطأ أثناء جلب أوردراتي",
    };
    clientSocket.emit("socketError", res);
    if (typeof cb === "function") cb(res);
  }
}
