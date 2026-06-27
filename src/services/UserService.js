import UserModel from "../app/Models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "./MailService.js";

// Lấy thông tin chi tiết của người dùng bằng userId
export const getUserProfile = async (userId) => {
  return await UserModel.findById(userId);
};

// Gửi liên kết đặt lại mật khẩu qua email cho người dùng
export const forgetPassword = async (email) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_RESET_PASSWORD_KEY,
    { expiresIn: "30m" }
  );

  const resetUrl = `${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/change-password?token=${resetToken}`;

  await sendMail(
    email,
    "Reset Password",
    `<p>Xin chào <strong>${user.username}</strong>,</p>
    <p>Chúng tôi nhận được yêu cầu thiết lập lại mật khẩu cho tài khoản của bạn trên RoPhim. Nếu bạn đã yêu cầu điều này, vui lòng nhấp vào liên kết bên dưới để thiết lập lại mật khẩu của bạn:</p>
    <p><a href="${resetUrl}" style="color: #15c;">Thiết lập lại mật khẩu</a></p>
    <p><strong>Lưu ý: Liên kết trên sẽ hết hạn sau 30 phút kể từ thời điểm yêu cầu.</strong></p>
    `
  );

  return resetToken;
};

// Xác thực tính hợp lệ của Token đặt lại mật khẩu
export const verifyResetPasswordToken = async (token) => {
  if (!token) {
    throw new Error("Token không được cung cấp");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_RESET_PASSWORD_KEY);
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      throw new Error("User không tồn tại hoặc đã bị xóa");
    }

    return user;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Expired");
    }
    throw error;
  }
};

// Đổi mật khẩu mới bằng Token đặt lại mật khẩu hợp lệ
export const changePassword = async (token, password, confirmPassword) => {
  if (!token) {
    throw new Error("Token không được cung cấp");
  }

  if (password !== confirmPassword) {
    throw new Error("Mật khẩu và xác nhận mật khẩu không khớp");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_RESET_PASSWORD_KEY);
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      throw new Error("User không tồn tại hoặc đã bị xóa");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Expired");
    }
    throw error;
  }
};

// Cập nhật thông tin cơ bản của hồ sơ người dùng
export const updateUserProfile = async (userId, updateFields) => {
  const { username, gender, avatar } = updateFields;
  return await UserModel.findByIdAndUpdate(userId, {
    username,
    gender,
    avatar,
  });
};
