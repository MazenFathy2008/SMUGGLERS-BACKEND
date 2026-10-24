import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required:   true, 
      trim: true,
      minlength: 2,
      maxlength: 50,
      match: /^[a-zA-Z\s'-]+$/,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^\+?[0-9]{10,15}$/,
    },

    password: {
      type: String,
      required: [true],
      minlength: 8,
      maxlength: 128,
    },

    role: {
      type: String,
      enum: ["member", "admin"],
      default: "member",
    },
  },
  {
    timestamps: true,
  },
);
const Users = mongoose.model("User", UserSchema);
export default Users;
