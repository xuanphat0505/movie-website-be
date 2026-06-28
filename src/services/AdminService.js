import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import UserModel from "../app/Models/UserModel.js";
import NotificationModel from "../app/Models/NotificationModel.js";
import { sendMail } from "./MailService.js";
import {
  emitUserAdded,
  emitUserUpdated,
  emitUserDeleted,
} from "../utils/AdminSocket.js";

// Cập nhật thông tin hồ sơ của Admin
export const updateAdminProfile = async (userId, data) => {
  const {
    username,
    email,
    password,
    currentPassword,
    phone,
    gender,
    avatar,
    adminInfo,
  } = data;

  const admin = await UserModel.findById(userId);
  if (!admin) {
    throw new Error("Không tìm thấy tài khoản admin");
  }

  if (admin.role !== "admin") {
    throw new Error("Tài khoản này không phải là admin");
  }

  if (password) {
    if (!currentPassword) {
      throw new Error("Vui lòng nhập mật khẩu hiện tại để xác thực");
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      throw new Error("Mật khẩu cũ không chính xác");
    }
  }

  if (username && username !== admin.username) {
    const existingUser = await UserModel.findOne({
      username,
      _id: { $ne: userId },
    });
    if (existingUser) {
      throw new Error("Username has been used !!");
    }
  }

  const adminObj = admin.toObject();

  const updateData = {
    username,
    email,
    phone,
    gender,
    avatar,
    adminInfo: {
      ...(adminObj.adminInfo || {}),
      ...(adminInfo || {}),
      notificationOptions: {
        ...(adminObj.adminInfo?.notificationOptions || {}),
        ...(adminInfo?.notificationOptions || {}),
      },
      loginHistory: [
        ...(adminObj.adminInfo?.loginHistory || []),
        ...(adminInfo?.loginHistory ? [adminInfo.loginHistory] : []),
      ],
    },
  };

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updatedAdmin = await UserModel.findByIdAndUpdate(userId, updateData, {
    new: true,
  });

  if (adminInfo?.lastLogin) {
    updatedAdmin.adminInfo.lastLogin = adminInfo.lastLogin;
    await updatedAdmin.save();
  }

  return updatedAdmin;
};

// Thêm người dùng mới vào hệ thống, tạo thông báo hoặc gửi email cho các admin khác
export const addNewUser = async (userData, io) => {
  const {
    username,
    email,
    role,
    status,
    avatar,
    phone,
    gender,
    position,
    department,
    permissions,
    notes,
    isSuper,
  } = userData;
  let { password } = userData;

  const existingUserByEmail = await UserModel.findOne({ email });
  if (existingUserByEmail) {
    throw new Error("Email has been used !!");
  }

  const existingUserByUsername = await UserModel.findOne({ username });
  if (existingUserByUsername) {
    throw new Error("Username has been used !!");
  }

  if (password) {
    password = await bcrypt.hash(password, 10);
  }

  const newUserData = {
    username,
    email,
    password,
    role,
    status,
    avatar,
    phone,
    gender,
  };

  if (role === "admin") {
    newUserData.adminInfo = {
      position: position || "Staff",
      department: department || "General",
      permissions: permissions || ["view", "edit"],
      notificationOptions: {
        mail: true,
        desktop: true,
      },
      notificationList: [],
      loginHistory: [],
      notes: notes || "",
      isSuper: isSuper || false,
    };

    const adminCount = await UserModel.countDocuments({ role: "admin" });
    if (adminCount === 0) {
      newUserData.adminInfo.isSuper = true;
      newUserData.adminInfo.permissions = ["all"];
      newUserData.status = "active";
    }
  }

  const user = await UserModel.create(newUserData);

  const allAdmins = await UserModel.find({ role: "admin" });

  const notificationDocs = allAdmins.map((admin) => ({
    adminId: admin._id,
    type: "add",
    message: `User <strong>${user.username || user._id}</strong> has been added`,
    read: false,
  }));

  const savedNotifications =
    await NotificationModel.insertMany(notificationDocs);

  const adminsWithDesktop = allAdmins.filter(
    (admin) => admin.adminInfo?.notificationOptions?.desktop !== false,
  );
  const adminsWithEmail = allAdmins.filter(
    (admin) => admin.adminInfo?.notificationOptions?.mail === true,
  );

  if (io && adminsWithDesktop.length > 0) {
    const notificationPayload = {
      _id: savedNotifications[0]?._id || new mongoose.Types.ObjectId(),
      type: "add",
      message: `User <strong>${user.username || user._id}</strong> has been added`,
      read: false,
      timestamp: new Date(),
    };
    emitUserAdded(io, notificationPayload);
  }

  if (adminsWithEmail.length > 0) {
    for (const admin of adminsWithEmail) {
      try {
        const emailContent = `
          <h2>Thông báo thêm người dùng mới</h2>
          <p>Xin chào <strong>${admin.username}</strong>,</p>
          <p>Một ${role === "admin" ? "quản trị viên" : "người dùng"} mới đã được thêm vào hệ thống.</p>
          <p>Tên người dùng: <strong>${user.username}</strong></p>
          <p>Email: <strong>${user.email}</strong></p>
          ${
            role === "admin"
              ? `<p>Phòng ban: <strong>${user.adminInfo.department}</strong></p>
          <p>Chức vụ: <strong>${user.adminInfo.position}</strong></p>`
              : ""
          }
          <p>Thời gian: ${new Date().toLocaleString("vi-VN")}</p>
        `;
        await sendMail(
          admin.email,
          `Thông báo: Thêm ${role === "admin" ? "quản trị viên" : "người dùng"} mới`,
          emailContent,
        );
      } catch (emailError) {
        console.error(
          `Lỗi khi gửi email đến admin ${admin.username}:`,
          emailError,
        );
      }
    }
  }

  return user;
};

// Lọc danh sách người dùng có phân trang
export const filterUsers = async (filters, pagination) => {
  const { status, role, gender } = filters;
  const { page = 1, limit = 10 } = pagination;

  const filter = {};
  if (status) filter.status = status;
  if (role) filter.role = role;
  if (gender) filter.gender = gender;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const users = await UserModel.find(filter).skip(skip).limit(limitNumber);
  const total = await UserModel.countDocuments(filter);

  return {
    users,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

// Tìm kiếm người dùng bằng từ khóa kèm bộ lọc và phân trang
export const searchUsers = async (filters, pagination) => {
  const { status, role, gender, keyword } = filters;
  const { page = 1, limit = 10 } = pagination;

  const query = {};
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

  return {
    users,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

// Xóa người dùng và phát tán thông báo qua email và socket.io
export const deleteUser = async (userId, io) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User không tồn tại");
  }

  if (user.role === "admin") {
    throw new Error("Không thể xóa tài khoản admin");
  }

  if (user.status === "active") {
    throw new Error("Không thể xóa tài khoản đang hoạt động");
  }

  const allAdmins = await UserModel.find({ role: "admin" });

  const notificationDocs = allAdmins.map((admin) => ({
    adminId: admin._id,
    type: "delete",
    message: `User <strong>${user.username || user._id}</strong> has been deleted`,
    read: false,
  }));

  const savedNotifications =
    await NotificationModel.insertMany(notificationDocs);

  const adminsWithDesktop = allAdmins.filter(
    (admin) => admin.adminInfo?.notificationOptions?.desktop !== false,
  );
  const adminsWithEmail = allAdmins.filter(
    (admin) => admin.adminInfo?.notificationOptions?.mail === true,
  );

  const deletedUser = await UserModel.findByIdAndDelete(userId);

  if (io && adminsWithDesktop.length > 0) {
    const notificationPayload = {
      _id: savedNotifications[0]?._id || new mongoose.Types.ObjectId(),
      type: "delete",
      message: `User <strong>${user.username || user._id}</strong> has been deleted`,
      read: false,
      timestamp: new Date(),
    };
    emitUserDeleted(io, notificationPayload);
  }

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
        await sendMail(admin.email, "Thông báo: Xóa người dùng", emailContent);
      } catch (emailError) {
        console.error(
          `Lỗi khi gửi email đến admin ${admin.username}:`,
          emailError,
        );
      }
    }
  }

  return deletedUser;
};

// Cập nhật thông tin người dùng, tạo thông báo cập nhật
export const updateUser = async (userId, updateFields, io) => {
  const { username, email, password, role, status, avatar, gender, phone } =
    updateFields;

  const existingUser = await UserModel.findById(userId);
  if (!existingUser) {
    throw new Error("Không tìm thấy user");
  }

  const duplicateUser = await UserModel.findOne({
    username,
    _id: { $ne: userId },
  });
  if (duplicateUser) {
    throw new Error("Username đã được sử dụng");
  }

  const updateData = {
    username,
    email,
    gender,
    phone,
    role,
    status,
    avatar,
  };

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
    new: true,
  });

  const allAdmins = await UserModel.find({ role: "admin" });

  const notificationDocs = allAdmins.map((admin) => ({
    adminId: admin._id,
    type: "update",
    message: `User <strong>${updatedUser.username || updatedUser._id}</strong> has been updated`,
    read: false,
  }));

  const savedNotifications =
    await NotificationModel.insertMany(notificationDocs);

  const adminsWithDesktop = allAdmins.filter(
    (admin) => admin.adminInfo?.notificationOptions?.desktop !== false,
  );
  const adminsWithEmail = allAdmins.filter(
    (admin) => admin.adminInfo?.notificationOptions?.mail === true,
  );

  if (io && adminsWithDesktop.length > 0) {
    const notificationPayload = {
      _id: savedNotifications[0]?._id || new mongoose.Types.ObjectId(),
      type: "update",
      message: `User <strong>${updatedUser.username || updatedUser._id}</strong> has been updated`,
      read: false,
      timestamp: new Date(),
    };
    emitUserUpdated(io, notificationPayload);
  }

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
          emailContent,
        );
      } catch (emailError) {
        console.error(
          `Lỗi khi gửi email đến admin ${admin.username}:`,
          emailError,
        );
      }
    }
  }

  return updatedUser;
};
