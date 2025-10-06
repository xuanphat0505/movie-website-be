import UserModel from "../Models/UserModel.js";

export const updateNotificationSettings = async (req, res) => {
  const userId = req.user._id;
  const { mail, desktop, sms } = req.body;

  try {
    // Validate that at least one setting is provided
    if (mail === undefined && desktop === undefined && sms === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one notification setting must be provided",
      });
    }

    // Validate types of provided settings
    if (
      (mail !== undefined && typeof mail !== "boolean") ||
      (desktop !== undefined && typeof desktop !== "boolean") ||
      (sms !== undefined && typeof sms !== "boolean")
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

    // Initialize adminInfo structure if needed
    if (!user.adminInfo) {
      user.adminInfo = {
        notificationOptions: {
          mail: false,
          desktop: true, // Default to true for desktop notifications
          sms: false,
        },
      };
    } else if (!user.adminInfo.notificationOptions) {
      user.adminInfo.notificationOptions = {
        mail: false,
        desktop: true, // Default to true for desktop notifications
        sms: false,
      };
    }

    // Update only the provided settings
    const currentSettings = user.adminInfo.notificationOptions;
    if (mail !== undefined) currentSettings.mail = mail;
    if (desktop !== undefined) currentSettings.desktop = desktop;
    if (sms !== undefined) currentSettings.sms = sms;

    // Save the changes
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

export const readOneNotification = async (req, res) => {
  const userId = req.user._id;
  const { notificationId } = req.params;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const notification = user.adminInfo.notificationList.find(
      (notif) => notif._id.toString() === notificationId
    );
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    notification.read = true;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Notification read successfully",
      data: notification,
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

export const readAllNotifications = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.adminInfo.notificationList.forEach(
      (notification) => (notification.read = true)
    );
    await user.save();
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

