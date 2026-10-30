import bcrypt from "bcryptjs";
import Users from "../model/users.model.js";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import { JWT_EXPIRES_IN, JWT_SECRET, NODE_ENV } from "../config/env.js";
import {
  sendPasswordResetEmail,
} from "../utils/email.js";

const isProduction = NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 15 * 24 * 60 * 60 * 1000,
};

/// SING UP///
const signUp = async (req, res, next) => {
  try {
    const { data } = req.body || {};
    if (
      !data ||
      typeof data.name !== "string" ||
      typeof data.email !== "string" ||
      typeof data.password !== "string" ||
      typeof data.phone !== "string" ||
      !Number.isFinite(Number(data.roomNumber))
    ) {
      return res.status(400).json({
        success: false,
        error: "INVALID_SIGNUP_DATA",
        message: "أكمل بيانات الحساب بشكل صحيح.",
      });
    }

    const userData = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: await bcrypt.hash(data.password, 12),
      phone: data.phone.trim(),
      roomNumber: Number(data.roomNumber),
    };
    const user = await Users.create(userData);
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      },
    );
    res.cookie("token", token, cookieOptions);
    res.status(201).json({
      success: true,
      user: {
        ...user.toObject(),
        password: null,
      },
    });
  } catch (error) {
    next(error);
  }
};
////////////////////////////

/// SIGN IN ///
const signIn = async (req, res, next) => {
  try {
    const { data } = req.body || {};
    const { email, password } = data || {};
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        error: "INVALID_CREDENTIALS",
        message: "أدخل البريد الإلكتروني وكلمة المرور.",
      });
    }

    const user = await Users.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "INVALID_CREDENTIALS",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: "INVALID_CREDENTIALS",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      },
    );
    res.cookie("token", token, cookieOptions);
    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        password: null,
      },
    });
  } catch (error) {
    next(error);
  }
};
///////////////

/// Sign out ///
const signOut = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
///////////

/// authMe ///
const authMe = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Users.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "DATA_NOT_FOUND",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};
//////////////

const requestPasswordReset = async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "أدخل البريد الإلكتروني.",
      });
    }

    const user = await Users.findOne({ email });
    if (user) {
      const token = randomBytes(32).toString("hex");
      user.passwordResetTokenHash = createHash("sha256")
        .update(token)
        .digest("hex");
      user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      try {
        await sendPasswordResetEmail(user.email, token);
      } catch (error) {
        user.passwordResetTokenHash = undefined;
        user.passwordResetExpiresAt = undefined;
        await user.save();
        throw error;
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "لو البريد مسجل عندنا، هيوصلك عليه رابط تغيير كلمة المرور خلال دقائق.",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body || {};
    if (
      typeof token !== "string" ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "الرابط أو كلمة المرور غير صالحين. استخدم 8 أحرف على الأقل.",
      });
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const user = await Users.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpiresAt");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "رابط الاستعادة غير صالح أو انتهت صلاحيته.",
      });
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "تم تغيير كلمة المرور. تقدر تسجل الدخول دلوقتي.",
    });
  } catch (error) {
    next(error);
  }
};

export {
  signUp,
  signIn,
  signOut,
  authMe,
  requestPasswordReset,
  resetPassword,
};
