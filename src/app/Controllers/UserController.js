import UserModel from "../Models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { sendMail } from "../../services/MailService.js";

export const getUser = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await UserModel.findById(userId);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Tạo JWT token có hạn 30 phút với thông tin user cần thiết
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_RESET_PASSWORD_KEY,
      { expiresIn: "30m" }
    );

    // Tạo URL đặt lại mật khẩu
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/change-password?token=${resetToken}`;

    // Gửi email với link reset
    await sendMail(
      email,
      "Reset Password",
      `<p>Xin chào <strong>${user.username}</strong>,</p>
      <p>Chúng tôi nhận được yêu cầu thiết lập lại mật khẩu cho tài khoản của bạn trên RoPhim. Nếu bạn đã yêu cầu điều này, vui lòng nhấp vào liên kết bên dưới để thiết lập lại mật khẩu của bạn:</p>
      <p><a href="${resetUrl}" style="color: #15c;">Thiết lập lại mật khẩu</a></p>
      <p><strong>Lưu ý:</strong></p>
      <ul>
        <li>Liên kết trên sẽ hết hạn sau 30 phút kể từ thời điểm yêu cầu.</li>
      </ul>
      `
    );

    return res.status(200).json({
      success: true,
      resetToken: resetToken,
      message:
        "Vui lòng kiểm tra email của bạn. Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyResetPaswordToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token không được cung cấp",
    });
  }

  try {
    // Xác thực JWT token
    const decoded = jwt.verify(token, process.env.JWT_RESET_PASSWORD_KEY);

    // Tìm user từ thông tin trong token
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User không tồn tại hoặc đã bị xóa",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token hợp lệ",
    });
  } catch (error) {
    // Xử lý các lỗi JWT cụ thể
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Liên kết đặt lại mật khẩu đã hết hạn",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token không được cung cấp",
    });
  }

  try {
    // Kiểm tra password và confirmPassword
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu và xác nhận mật khẩu không khớp",
      });
    }
    // Xác thực JWT token
    const decoded = jwt.verify(token, process.env.JWT_RESET_PASSWORD_KEY);

    // Tìm user từ thông tin trong token
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User không tồn tại hoặc đã bị xóa",
      });
    }
    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cập nhật mật khẩu
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Mật khẩu đã được cập nhật thành công",
    });
  } catch (error) {
    // Xử lý các lỗi JWT cụ thể
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Liên kết đặt lại mật khẩu đã hết hạn",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  const userId = req.user._id;
  const { username, gender, avatar } = req.body;
  try {
    const user = await UserModel.findByIdAndUpdate(userId, {
      username,
      gender,
      avatar,
    });
    return res
      .status(200)
      .json({
        success: true,
        message: "Cập nhận hồ sơ thành công",
        data: user,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
