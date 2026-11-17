import Orders from "../../model/orders.model.js";

export default async function getOrder(io, socket, data, callback) {
  let serverIo = io;
  let clientSocket = socket;
  let payload = data;
  let cb = callback;

  if (typeof io?.emit !== "function" && typeof socket?.emit === "function") {
    clientSocket = io;
    payload = socket;
    serverIo = data;
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

    const orderId =
      typeof payload === "string"
        ? payload
        : payload?.orderId || payload?.id;

    if (!orderId) {
      const res = { success: false, message: "معرف الأوردر مطلوب" };
      clientSocket.emit("socketError", res);
      if (typeof cb === "function") cb(res);
      return;
    }

    const order = await Orders.findById(orderId);
    if (!order) {
      const res = {
        success: false,
        message: "الأوردر غير موجود",
      };
      clientSocket.emit("socketError", res);
      if (typeof cb === "function") cb(res);
      return;
    }

    const canViewOrder =
      user.role === "admin" ||
      order.collector.id.toString() === user._id.toString() ||
      order.participants.some(
        (participant) => participant.id.toString() === user._id.toString(),
      );

    if (!canViewOrder) {
      const res = {
        success: false,
        message: "غير مصرح لك بعرض تفاصيل هذا الأوردر",
      };
      clientSocket.emit("socketError", res);
      if (typeof cb === "function") cb(res);
      return;
    }

    // Join room so socket receives live updates for this order
    await clientSocket.join(order._id.toString());

    const res = {
      success: true,
      order,
    };

    clientSocket.emit("orderDetails", res);
    if (typeof cb === "function") cb(res);
  } catch (err) {
    const res = {
      success: false,
      message: err.message || "حدث خطأ أثناء جلب تفاصيل الأوردر",
    };
    clientSocket.emit("socketError", res);
    if (typeof cb === "function") cb(res);
  }
}
