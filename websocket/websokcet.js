import verifyToken from "../utils/verfiy-token.js";
import errorHandler from "./errorHandler.js";
export default function setUpWepSocket(wss) {
  wss.on("connection", async (socket, request) => {
    try {
      const token = request.headers.cookie
        ?.split("; ")
        .find((cookie) => cookie.startsWith("token="))
        ?.split("=")[1];
      if (!token) {
        const error = new Error();
        error.statusCode = 401;
        error.errorCode = "NOT_AUTHENTICATED";
        throw error;
      }
      const user = await verifyToken(token);
      socket.on("close", () => {
        console.log("exited");
      });
      messageHandler(socket, user);
    } catch (err) {
      errorHandler(socket, err);
      socket.close();
    }
  });
}
