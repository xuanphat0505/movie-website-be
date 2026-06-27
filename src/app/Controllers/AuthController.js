import * as AuthService from "../../services/AuthService.js";
import dotenv from "dotenv";

dotenv.config();

// Helper cài đặt các mã xác thực accessToken và cookies refreshToken
const setAuthTokens = (res, user) => {
  const accessToken = AuthService.generateAccessToken(user);
  const refreshToken = AuthService.generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });

  return accessToken;
};

// Định dạng dữ liệu phản hồi người dùng
const formatUserResponse = (user, accessToken, message) => {
  const { password, ...userData } = user._doc;
  return {
    success: true,
    message: message || "Login Success",
    data: { ...userData, accessToken },
  };
};

// Đăng nhập tài khoản khách hàng thông thường
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await AuthService.baseLogin(email, password);
    const accessToken = setAuthTokens(res, user);
    return res.status(200).json(formatUserResponse(user, accessToken));
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Đăng nhập tài khoản quản trị hệ thống
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await AuthService.baseLogin(email, password, true);
    const accessToken = setAuthTokens(res, user);
    return res
      .status(200)
      .json(
        formatUserResponse(
          user,
          accessToken,
          "Login with admin account success"
        )
      );
  } catch (error) {
    return res.status(error.message.includes("Access denied") ? 403 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

// Đăng nhập bằng Google cho khách hàng
export const googleLogin = async (req, res) => {
  try {
    const userDecoded = await AuthService.verifyGoogleToken(req.body.code);
    const user = await AuthService.handleGoogleLogin(userDecoded);
    const accessToken = setAuthTokens(res, user);
    return res.status(200).json(formatUserResponse(user, accessToken));
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Đăng nhập bằng Google dành riêng cho Quản trị viên
export const adminGoogleLogin = async (req, res) => {
  try {
    const userDecoded = await AuthService.verifyGoogleToken(req.body.code);
    const user = await AuthService.handleGoogleLogin(userDecoded, true);
    const accessToken = setAuthTokens(res, user);
    return res.status(200).json(formatUserResponse(user, accessToken));
  } catch (error) {
    return res.status(error.message.includes("Access denied") ? 403 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

// Đăng ký tài khoản người dùng mới
export const register = async (req, res) => {
  try {
    const newUser = await AuthService.registerUser(req.body);
    return res
      .status(200)
      .json({ success: true, message: "Register Success", data: newUser });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Đăng xuất người dùng và làm sạch cookie chứa mã xác thực
export const logout = async (req, res) => {
  const userId = req.user._id;
  try {
    await AuthService.logoutUser(userId);
    res.clearCookie("refreshToken");
    return res.status(200).json({ success: true, message: "Logout Success" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Làm mới Access Token thông qua Refresh Token trong cookie
export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const { newAccessToken, newRefreshToken } = AuthService.refreshTokens(token);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Refresh Token Success",
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    return res.status(error.message === "Forbidden" ? 403 : 400).json({
      success: false,
      message: error.message,
    });
  }
};
