import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { sendMail } from "../../services/MailService.js";
import {
  emitUserAdded,
  emitUserUpdated,
  emitUserDeleted,
} from "../../utils/AdminSocket.js";
import UserModel from "../Models/UserModel.js";

export const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, password, phone, gender, avatar, adminInfo } =
      req.body;

    // Verify if the user exists and is an admin
    const admin = await UserModel.findById(userId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản admin",
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản này không phải là admin",
        
      });
    }

    // Check if username already exists
    if (username && username !== admin.username) {
      const existingUser = await UserModel.findOne({
        username,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username has been used !!",
        });
      }
    }

    // Prepare update data
    const updateData = {
      username,
      email,
      phone,
      gender,
      avatar,
      adminInfo: {
        ...admin.adminInfo,
        ...adminInfo,
        loginHistory: [
          ...(admin.adminInfo?.loginHistory || []),
          ...(adminInfo?.loginHistory ? [adminInfo.loginHistory] : []),
        ],
      },
    };

    // Hash password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update the admin profile
    const updatedAdmin = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    // Update last login if provided
    if (adminInfo?.lastLogin) {
      updatedAdmin.adminInfo.lastLogin = adminInfo.lastLogin;
      await updatedAdmin.save();
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin admin thành công",
      data: updatedAdmin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi cập nhật thông tin admin",
    });
  }
};

export const addNewUser = async (req, res) => {
  try {
    const { username, email, role, status, avatar, phone, gender } = req.body;
    let { password } = req.body;

    const existingUserByEmail = await UserModel.findOne({ email });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email has been used !!" });
    }

    const existingUserByUsername = await UserModel.findOne({ username });
    if (existingUserByUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Username has been used !!" });
    }

    if (password) {
      password = await bcrypt.hash(password, 10);
    }

    // Prepare user data
    const userData = {
      username,
      email,
      password,
      role,
      status,
      avatar,
      phone,
      gender,
    };

    // If role is admin, add admin-specific information
    if (role === "admin") {
      userData.adminInfo = {
        position: req.body.position || "Staff",
        department: req.body.department || "General",
        permissions: req.body.permissions || ["view", "edit"],
        notificationOptions: {
          mail: true,
          desktop: true,
        },
        notificationList: [],
        loginHistory: [],
        notes: req.body.notes || "",
        isSuper: req.body.isSuper || false,
      };

      // Validate admin creation
      const adminCount = await UserModel.countDocuments({ role: "admin" });
      if (adminCount === 0) {
        // If this is the first admin, make them super admin
        userData.adminInfo.isSuper = true;
        userData.adminInfo.permissions = ["all"];
        userData.status = "active"; // Auto activate first admin
      }
    }

    const user = await UserModel.create(userData);

    // Create notification
    const notification = {
      _id: new mongoose.Types.ObjectId(),
      type: "add",
      message: `User <strong>${user._id}</strong> has been added`,
      read: false,
      timestamp: new Date()
    };

    // Get admins with different notification preferences
    const [adminsWithDesktop, adminsWithEmail] = await Promise.all([
      UserModel.find({
        role: "admin",
        "adminInfo.notificationOptions.desktop": true,
      }),
      UserModel.find({
        role: "admin",
        "adminInfo.notificationOptions.mail": true,
      }),
    ]);

    // Update notification list for all admins
    await UserModel.updateMany(
      { role: "admin" },
      {
        $push: {
          "adminInfo.notificationList": notification
        },
      }
    );

    // Get the io instance and send desktop notifications
    const io = req.app.get("io");
    if (adminsWithDesktop.length > 0) {
      emitUserAdded(io, notification);
    }

    // Send email notifications
    if (adminsWithEmail.length > 0) {
      for (const admin of adminsWithEmail) {
        try {
          const emailContent = `
            <h2>Thông báo thêm người dùng mới</h2>
            <p>Xin chào <strong>${admin.username}</strong>,</p>
            <p>Một ${role === "admin" ? "quản trị viên" : "người dùng"} mới đã được thêm vào hệ thống.</p>
            <p>Tên người dùng: <strong>${user.username}</strong></p>
            <p>Email: <strong>${user.email}</strong></p>
            ${role === "admin" ? `<p>Phòng ban: <strong>${user.adminInfo.department}</strong></p>
            <p>Chức vụ: <strong>${user.adminInfo.position}</strong></p>` : ""}
            <p>Thời gian: ${new Date().toLocaleString("vi-VN")}</p>
          `;

          await sendMail(
            admin.email,
            `Thông báo: Thêm ${role === "admin" ? "quản trị viên" : "người dùng"} mới`,
            emailContent
          );
        } catch (emailError) {
          console.error(
            `Lỗi khi gửi email đến admin ${admin.username}:`,
            emailError
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Thêm ${role === "admin" ? "quản trị viên" : "người dùng"} thành công`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const filterUsers = async (req, res) => {
  try {
    const { status, role, gender, page = 1, limit = 10 } = req.query;
    // Xây dựng bộ lọc động
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    if (gender) filter.gender = gender;

    // Chuyển đổi page và limit sang kiểu số
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Truy vấn người dùng kèm phân trang
    const users = await UserModel.find(filter).skip(skip).limit(limitNumber);

    // Tổng số user thỏa điều kiện
    const total = await UserModel.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Lọc user thành công",
      data: users,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { status, role, gender, keyword, page = 1, limit = 10 } = req.query;

    // Build query object
    const query = {};

    // Only add filters if they are provided and not empty
    if (status) query.status = status;
    if (role) query.role = role;
    if (gender) query.gender = gender;
    if (keyword) {
      query.$or = [
        { username: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const users = await UserModel.find(query).skip(skip).limit(limitNumber);
    const total = await UserModel.countDocuments(query);
    return res.status(200).json({
      success: true,
      message: "Tìm kiếm user thành công",
      data: users,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User không tồn tại",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa tài khoản admin",
      });
    }

    if (user.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa tài khoản đang hoạt động",
      });
    }

    // Create notification
    const notification = {
      _id: new mongoose.Types.ObjectId(),
      type: "delete",
      message: `User <strong>${user._id}</strong> has been deleted`,
      read: false,
      timestamp: new Date()
    };

    // Get admins with different notification preferences
    const [adminsWithDesktop, adminsWithEmail] = await Promise.all([
      UserModel.find({
        role: "admin",
        "adminInfo.notificationOptions.desktop": true,
      }),
      UserModel.find({
        role: "admin",
        "adminInfo.notificationOptions.mail": true,
      }),
    ]);

    // Update notification list for all admins
    await UserModel.updateMany(
      { role: "admin" },
      {
        $push: {
          "adminInfo.notificationList": notification
        },
      }
    );

    // Delete the user
    const deletedUser = await UserModel.findByIdAndDelete(userId);

    // Get the io instance
    const io = req.app.get("io");

    // Send desktop notifications
    if (adminsWithDesktop.length > 0) {
      emitUserDeleted(io, notification);
    }

    // Send email notifications
    if (adminsWithEmail.length > 0) {
      for (const admin of adminsWithEmail) {
        try {
          const emailContent = `
            <h2>Thông báo xóa người dùng</h2>
            <p>Xin chào <strong>${admin.username}</strong>,</p>
            <p>Một người dùng đã bị xóa khỏi hệ thống.</p>
            <p>ID người dùng: <strong>${deletedUser._id}</strong></p>
            <p>Thời gian: ${new Date().toLocaleString("vi-VN")}</p>
          `;

          await sendMail(
            admin.email,
            "Thông báo: Xóa người dùng",
            emailContent
          );
        } catch (emailError) {
          console.error(
            `Lỗi khi gửi email đến admin ${admin.username}:`,
            emailError
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Xóa user thành công",
      data: deletedUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { username, email, password, role, status, avatar, gender, phone } =
    req.body;

  try {
    // Kiểm tra user tồn tại
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    // Kiểm tra username đã tồn tại
    const duplicateUser = await UserModel.findOne({
      username,
      _id: { $ne: userId },
    });

    if (duplicateUser) {
      return res.status(400).json({
        success: false,
        message: "Username đã được sử dụng",
      });
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      username,
      email,
      gender,
      phone,
      role,
      status,
      avatar,
    };

    // Nếu có password mới thì mã hóa
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Cập nhật thông tin user
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    // Create notification for the update
    const notification = {
      _id: new mongoose.Types.ObjectId(),
      type: "update",
      message: `User <strong>${updatedUser._id}</strong> has been updated`,
      read: false,
      timestamp: new Date()
    };

    // Get admins with different notification preferences
    const [adminsWithDesktop, adminsWithEmail] = await Promise.all([
      UserModel.find({
        role: "admin",
        "adminInfo.notificationOptions.desktop": true,
      }),
      UserModel.find({
        role: "admin",
        "adminInfo.notificationOptions.mail": true,
      }),
    ]);

    // Update notification list for all admins
    await UserModel.updateMany(
      { role: "admin" },
      {
        $push: {
          "adminInfo.notificationList": notification
        },
      }
    );

    // Get the io instance
    const io = req.app.get("io");

    // Send desktop notifications
    if (adminsWithDesktop.length > 0) {
      emitUserUpdated(io, notification);
    }

    // Send email notifications
    if (adminsWithEmail.length > 0) {
      for (const admin of adminsWithEmail) {
        try {
          const emailContent = `
            <h2>Thông báo cập nhật thông tin người dùng</h2>
            <p>Xin chào <strong>${admin.username}</strong>,</p>
            <p>Thông tin người dùng đã được cập nhật trong hệ thống.</p>
            <p>ID người dùng: <strong>${updatedUser._id}</strong></p>
            <p>Thời gian: ${new Date().toLocaleString("vi-VN")}</p>
          `;

          await sendMail(
            admin.email,
            "Thông báo: Cập nhật thông tin người dùng",
            emailContent
          );
        } catch (emailError) {
          console.error(
            `Lỗi khi gửi email đến admin ${admin.username}:`,
            emailError
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin user thành công",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật user:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi cập nhật thông tin user",
    });
  }
};
