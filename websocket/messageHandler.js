import errorHandler from "./errorHandler.js";
import startOrder from "./actions/startOrder.js";
import addOrder from "./actions/addOrder.js";
import modifyOrder from "./actions/modifyOrder.js";
import cancelOrder from "./actions/cancelOrder.js";
import finishOrder from "./actions/finishOrder.js";
import cancelAdminOrder from "./actions/cancelAdminOrder.js";
export default function messageHandler(socket, user) {
  socket.on("message", async (data) => {
    try {
      const message = JSON.parse(data.toString());
      const { payLoad, type } = message;
      if (!type || typeof type !== "string") {
        const error = new Error();
        error.statusCode = 400;
        error.errorCode = "INVALID_MESSAGE";
        throw error;
      }
      if (!payLoad || typeof payLoad !== "object" || Array.isArray(payLoad)) {
        const error = new Error();
        error.statusCode = 400;
        error.errorCode = "INVALID_PAYLOAD";
        throw error;
      }
      switch (type) {
        case "startOrder":
          await startOrder(socket, user, payLoad);
          break;
        case "addOrder":
          await addOrder(socket, user, payLoad);
          break;
        case "modifyOrder":
          await modifyOrder(socket, user, payLoad);
          break;
        case "cancelOrder":
          await cancelOrder(socket, user, payLoad);
          break;
        case "finishOrder":
          await finishOrder(socket, user, payLoad);
          break;
        case "cancelAdminOrder":
          await cancelAdminOrder(socket, user, payLoad);
          break;
        default: {
          const error = new Error();
          error.statusCode = 400;
          error.errorCode = "INVALID_MESSAGE";
          throw error;
        }
      }
    } catch (err) {
      errorHandler(socket, err);
    }
  });
}
