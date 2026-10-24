import bcrypt from "bcryptjs";
import Users from "../model/users.model.js";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET, NODE_ENV } from "../config/env.js";

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
    const { data } = req.body;
    data.password = await bcrypt.hash(data.password, 12);
    const user = await Users.create(data);
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
  const { data } = req.body;
  const { email, password } = data;
  const user = await Users.findOne({ email });
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
};
///////////////
export { signUp, signIn };
