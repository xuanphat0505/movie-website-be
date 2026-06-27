import mongoose from "mongoose";

// Định nghĩa lược đồ cấu hình hệ thống bao gồm chế độ bảo trì, số phim mỗi trang, số hotline và fanpage
const systemSettingSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    pageLimit: {
      type: Number,
      default: 12,
    },
    hotline: {
      type: String,
      default: "1900 6789",
    },
    facebookUrl: {
      type: String,
      default: "https://facebook.com/streamlab.vn",
    },
  },
  { timestamps: true }
);

export default mongoose.model("SystemSetting", systemSettingSchema);
