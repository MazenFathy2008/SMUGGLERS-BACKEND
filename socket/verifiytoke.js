import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { JWT_SECRET } from "../config/env.js";
import Users from "../model/users.model.js";  
const parseCookieHeader = (header = "") => {
  if (!header) return {};
  if (typeof cookie.parseCookie === "function") {
    return cookie.parseCookie(header);
  }
  if (typeof cookie.parse === "function") {
    return cookie.parse(header);
  }
  return {};
};
const verifyToken = async (socket, next) => {
  try {
    const cookies = parseCookieHeader(socket.handshake.headers.cookie || "");
    const token =
      cookies.token ||
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization?.startsWith("Bearer ")
        ? socket.handshake.headers.authorization.split(" ")[1]
        : socket.handshake.headers.authorization) ||
      socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Users.findById(decoded.id).select("-password");

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
