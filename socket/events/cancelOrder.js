import Orders from "../../model/orders.model.js";

export default async function cancelOrder(io, socket, data, callback) {
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
        message: "الأوردر المجمع غير موجود",
      };
      clientSocket.emit("socketError", res);
      if (typeof cb === "function") cb(res);
      return;
    }

    if (order.status !== "open") {
      const res = {
        success: false,
        message:
          "لا يمكن إلغاء الأوردر لأنه دخل مرحلة التنفيذ أو تم إغلاقه",
      };
      clientSocket.emit("socketError", res);
      if (typeof cb === "function") cb(res);
      return;
    }

    const participantIndex = order.participants.findIndex(
      (p) => p.user.toString() === user._id.toString()
    );

    if (participantIndex === -1) {
      const res = {
        success: false,
        message: "أنت لست مشتركاً في هذا الأوردر لإلغائه",
      };
      clientSocket.emit("socketError", res);
      if (typeof cb === "function") cb(res);
      return;
    }

    order.participants.splice(participantIndex, 1);
    await order.save();

    await clientSocket.leave(order._id.toString());

    const res = {
      success: true,
      message: "تم إلغاء أوردرك وخروجك من الطلب بنجاح",
      order,
      orderId: order._id,
    };

    clientSocket.emit("orderCancelledSuccess", res);

    if (serverIo) {
      serverIo.to(order._id.toString()).emit("orderUpdated", order);
      serverIo.to(order._id.toString()).emit("participantLeft", {
        orderId: order._id,
        userId: user._id,
      });
    }

    if (typeof cb === "function") cb(res);
  } catch (err) {
    const res = {
      success: false,
      message: err.message || "حدث خطأ أثناء إلغاء الأوردر",
    };
    clientSocket.emit("socketError", res);
    if (typeof cb === "function") cb(res);
  }
}
