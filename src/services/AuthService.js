import UserModel from "../app/Models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Tạo Access Token cho người dùng
export const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_ACCESSTOKEN_KEY,
    { expiresIn: "1d" }
  );
};

// Tạo Refresh Token cho người dùng
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_REFRESHTOKEN_KEY,
    { expiresIn: "365d" }
  );
};

// Xác thực Token của Google thông qua Google OAuth2 API
export const verifyGoogleToken = async (code) => {
  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: "postmessage",
      grant_type: "authorization_code",
    });

    const { id_token } = response.data;
    const userDecoded = jwt.decode(id_token);

    if (!userDecoded) {
      throw new Error("Invalid Google token");
    }

    return userDecoded;
  } catch (error) {
    throw new Error("Failed to verify Google token: " + error.message);
  }
};

// Tạo tên đăng nhập duy nhất không trùng lặp cho người dùng Google mới
const generateUniqueUsername = async (baseName) => {
  let username = baseName;
  let counter = 1;
  while (await UserModel.findOne({ username })) {
    username = `${baseName}${counter}`;
    counter++;
  }
  return username;
};

// Logic xử lý đăng nhập cơ bản bằng email và mật khẩu
export const baseLogin = async (email, password, requireAdmin = false) => {
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (requireAdmin && user.role !== "admin") {
    throw new Error("Access denied. Admin privileges required.");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new Error("Password is incorrect");
  }

  user.status = "active";
  await user.save();

  return user;
};

// Xử lý đăng nhập thông qua tài khoản Google
export const handleGoogleLogin = async (userDecoded, requireAdmin = false) => {
  let user = await UserModel.findOne({ googleId: userDecoded.sub });

  if (!user) {
    user = await UserModel.findOne({ email: userDecoded.email });
  }

  if (!user) {
    if (requireAdmin) {
      throw new Error("Access denied. Admin account not found.");
    }

    const username = await generateUniqueUsername(userDecoded.given_name);
    user = new UserModel({
      username,
      email: userDecoded.email,
      googleId: userDecoded.sub,
      gender: userDecoded.gender || "other",
      avatar:
        "https://res.cloudinary.com/drngsxvb3/image/upload/q_auto/f_auto/v1776490861/user_rnttki.png",
      role: "user",
      status: "active",
    });
    await user.save();
  } else {
    if (requireAdmin && user.role !== "admin") {
      throw new Error("Access denied. Admin privileges required.");
    }

    user.googleId = userDecoded.sub;
    user.avatar = userDecoded.picture
      ? encodeURI(userDecoded.picture)
      : user.avatar;
    user.status = "active";
    await user.save();
  }

  return user;
};

// Đăng ký tài khoản người dùng mới
export const registerUser = async (userData) => {
  const { username, email, password, confirmPassword } = userData;

  const existingUserByEmail = await UserModel.findOne({ email });
  if (existingUserByEmail) {
    throw new Error("Email has been used !!");
  }

  const existingUserByUsername = await UserModel.findOne({ username });
  if (existingUserByUsername) {
    throw new Error("Username has been used !!");
  }

  if (password !== confirmPassword) {
    throw new Error("Password and confirm password do not match !!");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new UserModel({
    username,
    email,
    password: hashedPassword,
  });

  await newUser.save();
  return newUser;
};

// Đăng xuất và cập nhật trạng thái ngoại tuyến cho tài khoản
export const logoutUser = async (userId) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.status = "inactive";
  user.accessToken = null;
  await user.save();
};

// Xác thực refresh token và tạo mới cặp access token, refresh token
export const refreshTokens = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESHTOKEN_KEY);
    const newAccessToken = generateAccessToken(decoded);
    const newRefreshToken = generateRefreshToken(decoded);
    return { newAccessToken, newRefreshToken };
  } catch (err) {
    throw new Error("Forbidden");
  }
};
