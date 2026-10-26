import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import Users from "../model/users.model.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Support token from Authorization header (Bearer <token>) as well
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "غير مصرح لك، يرجى تسجيل الدخول أولاً",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Users.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "التوكن غير صالح أو انتهت صلاحيته",
    });
  }
};
