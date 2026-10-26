import Orders from "../../../model/orders.model.js";
  try {
    const user = clientSocket.data?.user;
    if (!user) {
      const res = { success: false, message: "Authentication required" };
      clientSocket.emit("socketError", res);
      if (typeof cb === "function") cb(res);
      return;
    }

    if (user.role !== "admin") {
      const res = {
        success: false,
        message: "Only admins can create group orders",
      };
      clientSocket.emit("socketError", res);
      if (typeof cb === "function") cb(res);
      return;
    }

    try {
      const order = await Orders.create({
        ...payload,
        collector: {
          user: user._id,
          name: user.name,
          phone: user.phone,
          roomNumber: user.roomNumber,
        },
        status: "open",
      });

      await clientSocket.join(order._id.toString());

      const res = {
        success: true,
        message: "تم إنشاء الأوردر المجمع بنجاح",
        data: order,
        order,
      };

      clientSocket.emit("roomCreated", res);
      clientSocket.emit("orderCreated", res);

      if (serverIo) {
        serverIo.to("lobby").emit("newActiveOrder", order);
        serverIo.emit("orderCreated", order);
      }

      if (typeof cb === "function") cb(res);
    } catch (err) {
      const res = {
        success: false,
        message:
          err.message || "Missing data or wrong format please check your data",
      };
      clientSocket.emit("socketError", res);
      if (typeof cb === "function") cb(res);
    }
  } catch (err) {
    const res = {
      success: false,
      message: "something went wrong try again later",
    };
    clientSocket.emit("socketError", res);
    if (typeof cb === "function") cb(res);
  }