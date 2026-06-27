import * as UserService from "../../services/UserService.js";

// Lấy thông tin người dùng qua 
export const getUser = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await UserService.getUserProfile(userId);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Yêu cầu quên mật khẩu qua 
export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const resetToken = await UserService.forgetPassword(email);
    return res.status(200).json({
      success: true,
      resetToken: resetToken,
      message:
        "Vui lòng kiểm tra email của bạn. Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.",
    });
  } catch (error) {
    const status = error.message === "User not found" ? 400 : 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

// Xác thực token đặt lại mật khẩu qua 
export const verifyResetPaswordToken = async (req, res) => {
  const { token } = req.body;

  try {
    await UserService.verifyResetPasswordToken(token);
    return res.status(200).json({
      success: true,
      message: "Token hợp lệ",
    });
  } catch (error) {
    const isTokenError = error.message.includes("Token không") || error.message.includes("không tồn tại");
    const isExpired = error.message === "Expired";
    const status = isTokenError || isExpired ? 400 : 500;
    const message = isExpired ? "Liên kết đặt lại mật khẩu đã hết hạn" : error.message;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

// Đặt lại mật khẩu mới qua 
export const changePassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  try {
    await UserService.changePassword(token, password, confirmPassword);
    return res.status(200).json({
      success: true,
      message: "Mật khẩu đã được cập nhật thành công",
    });
  } catch (error) {
    const isTokenError =
      error.message.includes("Token không") ||
      error.message.includes("không khớp") ||
      error.message.includes("không tồn tại");
    const isExpired = error.message === "Expired";
    const status = isTokenError || isExpired ? 400 : 500;
    const message = isExpired ? "Liên kết đặt lại mật khẩu đã hết hạn" : error.message;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

// Cập nhật hồ sơ người dùng qua 
export const updateUser = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await UserService.updateUserProfile(userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Cập nhận hồ sơ thành công",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
