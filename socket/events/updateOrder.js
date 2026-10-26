import Orders from "../../model/orders.model.js";

export default async function updateOrder(io, socket, data, callback) {
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

    const { orderId, items, deliveryFee } = payload || {};

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
          "عفواً، تم إغلاق الأوردر أو دخل مرحلة التنفيذ ولا يمكن تعديله",
      };
      clientSocket.emit("socketError", res);
      if (typeof cb === "function") cb(res);
      return;
    }

    const participant = order.participants.find(
      (p) => p.user.toString() === user._id.toString()
    );

    if (!participant) {
      const res = {
        success: false,
        message: "لم يتم العثور على أوردر خاص بك في هذا الطلب المجمع",
      };
      clientSocket.emit("socketError", res);
      if (typeof cb === "function") cb(res);
      return;
    }

    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (!item.name || typeof item.name !== "string" || !item.name.trim()) {
          const res = { success: false, message: "اسم الصنف غير صالح" };
          clientSocket.emit("socketError", res);
          if (typeof cb === "function") cb(res);
          return;
        }
        if (
          item.quantity === undefined ||
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) < 1
        ) {
          const res = {
            success: false,
            message: "كمية الصنف يجب أن تكون رقماً صحيحاً أكبر من صفر",
          };
          clientSocket.emit("socketError", res);
          if (typeof cb === "function") cb(res);
          return;
        }
      }
      participant.items = items.map((it) => ({
        name: it.name.trim(),
        quantity: Number(it.quantity),
      }));
    }

    if (deliveryFee !== undefined) {
      participant.deliveryFee = Number(deliveryFee) || 0;
    }

    // Check closing policy if delivery target is configured
    if (
      order.settings?.closingPolicy === "delivery_target" &&
      order.settings?.targetDeliveryAmount
    ) {
      const totalDeliveryFee = order.participants.reduce(
        (sum, p) => sum + (p.deliveryFee || 0),
        0
      );
      if (totalDeliveryFee >= order.settings.targetDeliveryAmount) {
        order.status = "closed";
      }
    }

    await order.save();

    const res = {
      success: true,
      message: "تم تعديل أوردرك بنجاح",
      order,
      participant,
    };

    clientSocket.emit("orderUpdatedSuccess", res);

    if (serverIo) {
      serverIo.to(order._id.toString()).emit("orderUpdated", order);
      serverIo.to(order._id.toString()).emit("participantUpdated", {
        orderId: order._id,
        participant,
      });

      if (order.status === "closed") {
        serverIo.to(order._id.toString()).emit("orderStatusUpdated", {
          orderId: order._id,
          status: "closed",
          order,
        });
        serverIo.to("lobby").emit("orderClosed", { orderId: order._id });
        serverIo.to("lobby").emit("activeOrderRemoved", { orderId: order._id });
      }
    }

    if (typeof cb === "function") cb(res);
  } catch (err) {
    const res = {
      success: false,
      message: err.message || "حدث خطأ أثناء تعديل الأوردر",
    };
    clientSocket.emit("socketError", res);
    if (typeof cb === "function") cb(res);
  }
}
