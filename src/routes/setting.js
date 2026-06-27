import express from "express";
import {
  getSystemSettings,
  updateSystemSettings,
} from "../app/Controllers/SystemSettingController.js";
import { verifyAdmin } from "../middlewares/verify.js";

const router = express.Router();

// Khai báo tuyến đường lấy cấu hình công khai của hệ thống cho phía client
router.get("/", getSystemSettings);

// Khai báo tuyến đường cập nhật cấu hình hệ thống yêu cầu quyền quản trị viên
router.put("/", verifyAdmin, updateSystemSettings);

export default router;
