import UserModel from "../Models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_ACCESSTOKEN_KEY,
    { expiresIn: "1d" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_REFRESHTOKEN_KEY,
    { expiresIn: "365d" }
  );
};

// Helper function to set authentication tokens
const setAuthTokens = (res, user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });

  return accessToken;
};

// Helper function to validate Google token and get user info
const verifyGoogleToken = async (code) => {
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

// Helper function to format user response
const formatUserResponse = (user, accessToken, message) => {
  const { password, ...userData } = user._doc;
  return {
    success: true,
    message: message || "Login Success",
    data: { ...userData, accessToken },
  };
};

// Base login function that can be used for both regular and admin login
const baseLogin = async (email, password, requireAdmin = false) => {
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

  // Update user status to active when logging in
  user.status = "active";
  await user.save();

  return user;
};

// Regular login endpoints
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await baseLogin(email, password);
    const accessToken = setAuthTokens(res, user);
    return res.status(200).json(formatUserResponse(user, accessToken));
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await baseLogin(email, password, true);
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
    return res.status(error.message.includes("Admin") ? 403 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

// Google login endpoints
const handleGoogleLogin = async (userDecoded, requireAdmin = false) => {
  let user = await UserModel.findOne({ googleId: userDecoded.sub });

  if (!user) {
    user = await UserModel.findOne({ email: userDecoded.email });
  }

  if (!user) {
    if (requireAdmin) {
      throw new Error("Access denied. Admin account not found.");
    }
    // For regular users, create new account
    const username = await generateUniqueUsername(userDecoded.given_name);
    user = new UserModel({
      username,
      email: userDecoded.email,
      googleId: userDecoded.sub,
      gender: userDecoded.gender || "other",
      avatar:
        "https://res.cloudinary.com/djmeybzjk/image/upload/v1745252587/01_odv3vg.jpg",
      role: "user",
      status: "active", // Set initial status to active
    });
    await user.save();
  } else {
    if (requireAdmin && user.role !== "admin") {
      throw new Error("Access denied. Admin privileges required.");
    }
    // Update Google ID, avatar, and status
    user.googleId = userDecoded.sub;
    user.avatar = userDecoded.picture
      ? encodeURI(userDecoded.picture)
      : user.avatar;
    user.status = "active"; // Update status to active when logging in
    await user.save();
  }

  return user;
};

// Helper function to generate unique username
const generateUniqueUsername = async (baseName) => {
  let username = baseName;
  let counter = 1;
  while (await UserModel.findOne({ username })) {
    username = `${baseName}${counter}`;
    counter++;
  }
  return username;
};

export const googleLogin = async (req, res) => {
  try {
    const userDecoded = await verifyGoogleToken(req.body.code);
    const user = await handleGoogleLogin(userDecoded);
    const accessToken = setAuthTokens(res, user);
    return res.status(200).json(formatUserResponse(user, accessToken));
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const adminGoogleLogin = async (req, res) => {
  try {
    const userDecoded = await verifyGoogleToken(req.body.code);
    const user = await handleGoogleLogin(userDecoded, true);
    const accessToken = setAuthTokens(res, user);
    return res.status(200).json(formatUserResponse(user, accessToken));
  } catch (error) {
    return res.status(error.message.includes("Admin") ? 403 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const register = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hash = bcrypt.hashSync(password, salt);
  try {
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

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match !!",
      });
    }

    const newUser = new UserModel({
      username: username,
      email: email,
      password: hash,
    });
    await newUser.save();
    return res
      .status(200)
      .json({ success: true, message: "Register Success", data: newUser });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const logout = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    // Update user status to inactive when logging out
    user.status = "inactive";
    user.accessToken = null;
    await user.save();
    
    res.clearCookie("refreshToken");
    return res.status(200).json({ success: true, message: "Logout Success" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  try {
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESHTOKEN_KEY,
      async (err, user) => {
        if (err) {
          return res.status(403).json({ success: false, message: "Forbidden" });
        }
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // cross-site cookie in production
          path: "/",
        });
        return res.status(200).json({
          success: true,
          message: "Refresh Token Success",
          data: { accessToken: newAccessToken },
        });
      }
    );
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
