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

export const login = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Password is incorrect" });
    }
    const { role, password, ...rest } = user._doc;
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // cross-site cookie in production
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login Success",
      data: { ...rest, accessToken },
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const googleLogin = async (req, res) => {
  const { code } = req.body;
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
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    
    // First try to find user by Google ID
    let user = await UserModel.findOne({ googleId: userDecoded.sub });
    
    // If not found by Google ID, try by email
    if (!user) {
      user = await UserModel.findOne({ email: userDecoded.email });
      
      // If user exists with this email but has a password, they've registered normally
      if (user && user.password) {
        return res
          .status(400)
          .json({ success: false, message: "Email already registered. Please use password to login." });
      }
    }
    
    // Create new user if not found
    if (!user) {
      user = new UserModel({
        username: userDecoded.given_name,
        email: userDecoded.email,
        googleId: userDecoded.sub,
        gender: userDecoded.gender || "other",
        avatar: userDecoded.picture || "",
        role: "user",
      });
      await user.save();
    } else if (!user.googleId) {
      // Update existing user with Google ID if they don't have one
      user.googleId = userDecoded.sub;
      await user.save();
    }
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const { password, ...rest } = user._doc;
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login Success",
      data: { ...rest, accessToken },
    });
  } catch (error) {
    console.error("Google login error:", error);
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
