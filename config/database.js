import mongoose from "mongoose";
import { MONGODB_URI } from "./env.js";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};
export default connectDB;
