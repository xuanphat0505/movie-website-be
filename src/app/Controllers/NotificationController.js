import UserModel from "../Models/UserModel.js";
import NotificationModel from "../Models/NotificationModel.js";

// Lấy danh sách tất cả thông báo của quản trị viên hiện tại
export const getNotifications = async (req, res) => {
  const userId = req.user._id;

  try {
    // Truy vấn danh sách thông báo của admin từ collection riêng biệt
    const notifications = await NotificationModel.find({ adminId: userId })
      .sort({ createdAt: -1 });

    // Định dạng lại kết quả để tương thích với trường timestamp ở Client
    const formattedNotifications = notifications.map((notif) => ({
      _id: notif._id,
      type: notif.type,
      message: notif.message,
      read: notif.read,
      timestamp: notif.createdAt,
    }));

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
  const { mail, desktop } = req.body;

  try {
    if (mail === undefined && desktop === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one notification setting must be provided",
      });
    }

    if (
      (mail !== undefined && typeof mail !== "boolean") ||
      (desktop !== undefined && typeof desktop !== "boolean")
    ) {
      return res.status(400).json({
        success: false,
        message: "Notification settings must be boolean values",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin users can configure notification settings",
      });
    }

    if (!user.adminInfo) {
      user.adminInfo = {
        notificationOptions: {
          mail: true,
          desktop: true,
        },
      };
    } else if (!user.adminInfo.notificationOptions) {
      user.adminInfo.notificationOptions = {
        mail: true,
        desktop: true,
      };
    }

    const currentSettings = user.adminInfo.notificationOptions;
    if (mail !== undefined) currentSettings.mail = mail;
    if (desktop !== undefined) currentSettings.desktop = desktop;

    await user.save();

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
    return res.status(500).json({
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
    // Tìm và cập nhật trạng thái đọc của thông báo
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, adminId: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification read successfully",
      data: {
        _id: notification._id,
        type: notification.type,
        message: notification.message,
        read: notification.read,
        timestamp: notification.createdAt,
      },
    });
  } catch (error) {
    console.error("Error reading notification:", error);
    return res.status(500).json({
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
    // Cập nhật tất cả thông báo chưa đọc của admin hiện tại thành đã đọc
    await NotificationModel.updateMany(
      { adminId: userId, read: false },
      { read: true }
    );

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
