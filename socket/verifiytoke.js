import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { JWT_SECRET } from "../config/env.js";
import Users from "../model/users.model.js";
const verifyToken = async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    const id = jwt.verify(token, JWT_SECRET).id;
    const user = await Users.findById(id);
    if (!user) {
      return next(new Error("User not found"));
    }
    socket.data.user = user;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
};
export default verifyToken;
