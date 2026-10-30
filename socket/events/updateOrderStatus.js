import Orders from "../../model/orders.model.js";

export default async function updateOrderStatus(io, socket, data, callback) {
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

    const { orderId, status } = payload || {};

    if (!orderId || !status) {
      const res = { success: false, message: "معرف الأوردر والحالة مطلوبان" };
      clientSocket.emit("socketError", res);
      if (typeof cb === "function") cb(res);
      return;
    }

    const validStatuses = ["open", "closed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      const res = {
        success: false,
        message: `حالة غير صالحة. الحالات المتاحة: ${validStatuses.join(", ")}`,
      };
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

    // Only collector of this order or admin can update the order status
    const isCollector =
      order.collector.id.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isCollector && !isAdmin) {
      const res = {
        success: false,
        message: "غير مصرح لك بتغيير حالة هذا الأوردر",
      };
      clientSocket.emit("socketError", res);
      if (typeof cb === "function") cb(res);
      return;
    }

    order.status = status;
    await order.save();

    const res = {
      success: true,
      message: `تم تحديث حالة الأوردر إلى ${status}`,
      order,
    };

    clientSocket.emit("orderStatusUpdatedSuccess", res);

    if (serverIo) {
      serverIo.to(order._id.toString()).emit("orderUpdated", order);
      serverIo.to(order._id.toString()).emit("orderStatusUpdated", {
        orderId: order._id,
        status,
        order,
      });

      if (status !== "open") {
        serverIo.to("lobby").emit("orderClosed", { orderId: order._id });
        serverIo.to("lobby").emit("activeOrderRemoved", { orderId: order._id });
      } else {
        serverIo.to("lobby").emit("newActiveOrder", order);
      }
    }

    if (typeof cb === "function") cb(res);
  } catch (err) {
    const res = {
      success: false,
      message: err.message || "حدث خطأ أثناء تحديث حالة الأوردر",
    };
    clientSocket.emit("socketError", res);
    if (typeof cb === "function") cb(res);
  }
}
