import * as NotificationService from "../../services/NotificationService.js";

// Lấy danh sách tất cả thông báo của quản trị viên hiện tại 
export const getNotifications = async (req, res) => {
  const userId = req.user._id;

  try {
    const formattedNotifications = await NotificationService.getNotificationsForAdmin(userId);
    return res.status(200).json({
      success: true,
      data: formattedNotifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Cập nhật cài đặt nhận thông báo của quản trị viên (mail, desktop) 
export const updateNotificationSettings = async (req, res) => {
  const userId = req.user._id;

  try {
    const currentSettings = await NotificationService.updateNotificationSettings(userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Notification settings updated successfully",
      data: {
        notificationOptions: currentSettings,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("Only admin")
      ? 403
      : 400;
    return res.status(status).json({
      success: false,
      message: "Error updating notification settings",
      error: error.message,
    });
  }
};

// Đánh dấu một thông báo cụ thể là đã đọc 
export const readOneNotification = async (req, res) => {
  const userId = req.user._id;
  const { notificationId } = req.params;

  try {
    const data = await NotificationService.readOneNotification(notificationId, userId);
    return res.status(200).json({
      success: true,
      message: "Notification read successfully",
      data,
    });
  } catch (error) {
    console.error("Error reading notification:", error);
    return res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: "Error reading notification",
      error: error.message,
    });
  }
};

// Đánh dấu tất cả thông báo là đã đọc 
export const readAllNotifications = async (req, res) => {
  const userId = req.user._id;

  try {
    await NotificationService.readAllNotifications(userId);
    return res.status(200).json({
      success: true,
      message: "All notifications read successfully",
    });
  } catch (error) {
    console.error("Error reading all notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Error reading all notifications",
      error: error.message,
    });
  }
};
