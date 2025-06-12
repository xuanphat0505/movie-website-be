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
        "https://res.cloudinary.com/djmeybzjk/image/upload/v1745252587/01_odv3vg.jpg",
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
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
        notificationList: [
          {
            _id: { type: mongoose.Schema.Types.ObjectId, required: true },
            type: { type: String, enum: ["add", "update", "delete"] },
            message: { type: String },
            read: { type: Boolean, default: false },
            timestamp: { type: Date, default: Date.now }
          }
        ],
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
  { timestamps: true }
);

const UserModel = mongoose.model("users", userSchema);

export default UserModel;
