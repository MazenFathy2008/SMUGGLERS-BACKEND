
import errorHandler from "./errorHandler.js";
export default function messageHandler(socket, user) {
  socket.on("message", (data) => {
    try {
      data = JSON.parse(data);
      const { payLoad, type } = data;
      if (!type) {
        const error = new Error();
        error.statusCode = 400;
        error.errorCode = "INVALID_MESSAGE";
        throw error;
      }
      if (!payLoad) {
        const error = new Error();
        error.statusCode = 400;
        error.errorCode = "INVALID_PAYLOAD";
        throw error;
      }
      switch (type) {
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
