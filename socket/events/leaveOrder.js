export default async function leaveOrder(io, socket, data, callback) {
  let clientSocket = socket;
  let payload = data;
  let cb = callback;

  if (typeof io?.emit !== "function" && typeof socket?.emit === "function") {
    clientSocket = io;
    payload = socket;
    cb = callback;
  }

  try {
    const orderId =
      typeof payload === "string"
        ? payload
        : payload?.orderId || payload?.id;

    if (orderId) {
      await clientSocket.leave(orderId.toString());
    }

    const res = {
      success: true,
      message: "تمت مغادرة غرفة الأوردر",
      orderId,
    };

    clientSocket.emit("orderLeft", res);
    if (typeof cb === "function") cb(res);
  } catch (err) {
    const res = {
      success: false,
      message: err.message || "حدث خطأ أثناء مغادرة الغرفة",
    };
    clientSocket.emit("socketError", res);
    if (typeof cb === "function") cb(res);
  }
}
