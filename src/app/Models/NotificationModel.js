import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["add", "update", "delete", "report"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000, // Tự động xóa khỏi Database sau 30 ngày 
    },
  },
  { timestamps: false } // Không cần updatedAt vì dùng TTL trên createdAt
);

export default mongoose.model("Notification", notificationSchema);
