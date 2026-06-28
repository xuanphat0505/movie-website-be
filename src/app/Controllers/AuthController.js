import * as AuthService from "../../services/AuthService.js";
import dotenv from "dotenv";
import { generateSecret, verify, generateURI } from "otplib";
import qrcode from "qrcode";
import jwt from "jsonwebtoken";
import UserModel from "../Models/UserModel.js";

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

    // Kiểm tra nếu người dùng đã kích hoạt bảo mật hai lớp
    if (user.isMfaEnabled) {
      const tempToken = jwt.sign(
        { userId: user._id, isMfaPending: true },
        process.env.JWT_ACCESSTOKEN_KEY,
        { expiresIn: "5m" }
      );
      return res.status(200).json({
        success: true,
        message: "MFA verification required",
        data: {
          mfaRequired: true,
          tempToken,
        },
      });
    }

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

// Thiết lập bảo mật hai lớp (Tạo khóa bí mật và mã QR)
export const mfaSetup = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Sinh mã bí mật TOTP ngẫu nhiên
    const secret = generateSecret();
    // Tạo URI cho ứng dụng authenticator
    const otpauthUrl = generateURI({ secret, label: user.email, issuer: "StreamLab Admin" });
    // Sinh mã QR dạng base64 từ URI
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    return res.status(200).json({
      success: true,
      message: "Generate MFA secret success",
      data: {
        secret,
        qrCodeUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Xác thực và kích hoạt bảo mật hai lớp
export const mfaVerify = async (req, res) => {
  try {
    const { token, secret } = req.body;
    if (!token || !secret) {
      return res.status(400).json({ success: false, message: "Token and secret are required" });
    }

    // Kiểm tra mã OTP gửi lên với secret
    const result = await verify({ token, secret });
    if (!result.valid) {
      return res.status(400).json({ success: false, message: "Invalid OTP code" });
    }

    // Lưu khóa bí mật và kích hoạt MFA cho người dùng
    await UserModel.findByIdAndUpdate(req.user._id, {
      mfaSecret: secret,
      isMfaEnabled: true,
    });

    return res.status(200).json({
      success: true,
      message: "MFA has been enabled successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Hủy kích hoạt bảo mật hai lớp
export const mfaDisable = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "OTP code is required" });
    }

    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isMfaEnabled) {
      return res.status(400).json({ success: false, message: "MFA is not enabled" });
    }

    // Xác thực mã OTP gửi lên với secret đã lưu
    const result = await verify({ token, secret: user.mfaSecret });
    if (!result.valid) {
      return res.status(400).json({ success: false, message: "Invalid OTP code" });
    }

    // Hủy kích hoạt MFA
    user.isMfaEnabled = false;
    user.mfaSecret = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "MFA has been disabled successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng nhập bước 2 bằng mã xác thực hai lớp (OTP)
export const adminMfaLogin = async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
      return res.status(400).json({ success: false, message: "Temp token and OTP code are required" });
    }

    // Xác thực tempToken
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_ACCESSTOKEN_KEY);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Session expired or invalid token" });
    }

    if (!decoded.isMfaPending) {
      return res.status(400).json({ success: false, message: "Invalid authentication state" });
    }

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Xác thực mã OTP bằng mfaSecret đã lưu
    const result = await verify({ token: code, secret: user.mfaSecret });
    if (!result.valid) {
      return res.status(400).json({ success: false, message: "Invalid OTP code" });
    }

    // Cập nhật trạng thái người dùng thành hoạt động
    user.status = "active";
    await user.save();

    // Sinh access token và refresh token chính thức
    const accessToken = setAuthTokens(res, user);
    return res.status(200).json(formatUserResponse(user, accessToken, "MFA authentication successful"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
