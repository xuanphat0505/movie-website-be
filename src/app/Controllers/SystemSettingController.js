import SystemSetting from "../Models/SystemSettingModel.js";

// Lấy cấu hình hệ thống hiện tại và tạo mặc định nếu chưa tồn tại trong cơ sở dữ liệu
export const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({
        maintenanceMode: false,
        pageLimit: 12,
        hotline: "1900 6789",
        facebookUrl: "https://facebook.com/streamlab.vn",
      });
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật cấu hình hệ thống và phát tín hiệu thay đổi đến các client qua Socket.io
export const updateSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = new SystemSetting();
    }

    const { maintenanceMode, pageLimit, hotline, facebookUrl } = req.body;
    if (maintenanceMode !== undefined) {
      settings.maintenanceMode = maintenanceMode;
    }
    if (pageLimit !== undefined) {
      settings.pageLimit = pageLimit;
    }
    if (hotline !== undefined) {
      settings.hotline = hotline;
    }
    if (facebookUrl !== undefined) {
      settings.facebookUrl = facebookUrl;
    }

    await settings.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("settings_updated", settings);
    }

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
