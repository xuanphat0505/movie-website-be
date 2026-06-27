import UserModel from "../app/Models/UserModel.js";
import NotificationModel from "../app/Models/NotificationModel.js";

// Lấy danh sách tất cả các thông báo định dạng tương thích với client
export const getNotificationsForAdmin = async (userId) => {
  const notifications = await NotificationModel.find({ adminId: userId }).sort({
    createdAt: -1,
  });

  return notifications.map((notif) => ({
    _id: notif._id,
    type: notif.type,
    message: notif.message,
    read: notif.read,
    timestamp: notif.createdAt,
  }));
};

// Cập nhật tùy chọn nhận thông báo của admin
export const updateNotificationSettings = async (userId, settingsData) => {
  const { mail, desktop } = settingsData;

  if (mail === undefined && desktop === undefined) {
    throw new Error("At least one notification setting must be provided");
  }

  if (
    (mail !== undefined && typeof mail !== "boolean") ||
    (desktop !== undefined && typeof desktop !== "boolean")
  ) {
    throw new Error("Notification settings must be boolean values");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "admin") {
    throw new Error("Only admin users can configure notification settings");
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
  return currentSettings;
};

// Đánh dấu một thông báo là đã đọc
export const readOneNotification = async (notificationId, userId) => {
  const notification = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, adminId: userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new Error("Notification not found");
  }

  return {
    _id: notification._id,
    type: notification.type,
    message: notification.message,
    read: notification.read,
    timestamp: notification.createdAt,
  };
};

// Đánh dấu toàn bộ các thông báo của admin là đã đọc
export const readAllNotifications = async (userId) => {
  await NotificationModel.updateMany(
    { adminId: userId, read: false },
    { read: true }
  );
};
