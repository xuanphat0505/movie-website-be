import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    phone: { type: String },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/drngsxvb3/image/upload/q_auto/f_auto/v1776490861/user_rnttki.png",
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    // Trạng thái kích hoạt bảo mật hai lớp
    isMfaEnabled: { type: Boolean, default: false },
    // Khóa bí mật dùng để sinh mã xác thực TOTP
    mfaSecret: { type: String, default: null },
    // Admin specific fields
    adminInfo: {
      type: {
        position: { type: String },
        department: { type: String },
        permissions: [{ type: String }],
        lastLogin: { type: Date },
        notificationOptions: {
          mail: { type: Boolean, default: true },
          desktop: { type: Boolean, default: true },
        },
        loginHistory: [
          {
            timestamp: { type: Date },
            ipAddress: { type: String },
            device: { type: String },
          },
        ],
        notes: { type: String },
        isSuper: { type: Boolean, default: false },
      },
      default: null,
    },
  },
  { timestamps: true },
);

const UserModel = mongoose.model("users", userSchema);

export default UserModel;
