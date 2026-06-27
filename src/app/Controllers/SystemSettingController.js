import * as SettingService from "../../services/SystemSettingService.js";

// Lấy cấu hình hệ thống hiện tại
export const getSystemSettings = async (req, res) => {
  try {
    const settings = await SettingService.getSettings();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật cấu hình hệ thống và phát tín hiệu qua Socket.io
export const updateSystemSettings = async (req, res) => {
  try {
    const settings = await SettingService.updateSettings(req.body);

    const io = req.app.get("io");
    if (io) {
      io.emit("settings_updated", settings);
    }

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
