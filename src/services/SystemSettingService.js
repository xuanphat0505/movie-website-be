import SystemSetting from "../app/Models/SystemSettingModel.js";

// Lấy cấu hình hệ thống hiện tại 
export const getSettings = async () => {
  let settings = await SystemSetting.findOne();
  if (!settings) {
    settings = await SystemSetting.create({
      maintenanceMode: false,
      pageLimit: 12,
      hotline: "1900 6789",
      facebookUrl: "https://facebook.com/streamlab.vn",
    });
  }
  return settings;
};

// Cập nhật các trường cấu hình hệ thống
export const updateSettings = async (updateData) => {
  let settings = await SystemSetting.findOne();
  if (!settings) {
    settings = new SystemSetting();
  }

  const { maintenanceMode, pageLimit, hotline, facebookUrl } = updateData;
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
  return settings;
};
