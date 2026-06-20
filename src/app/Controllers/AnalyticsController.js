import User from "../Models/UserModel.js";
import Favorite from "../Models/FavoriteModel.js";
import Comment from "../Models/CommentModel.js";

export const getActiveUsers = async (req, res) => {
  try {
    const activeUsers = await User.find({ status: "active" });
    res.status(200).json({ data: activeUsers.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMaleUsers = async (req, res) => {
  try {
    const maleUsers = await User.find({ gender: "male" });
    res.status(200).json({ data: maleUsers.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFemaleUsers = async (req, res) => {
  try {
    const femaleUsers = await User.find({ gender: "female" });
    res.status(200).json({ data: femaleUsers.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.status(200).json({ data: totalUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardOverviewStats = async (req, res) => {
  try {
    const [totalUsers, totalFavorites, totalComments] = await Promise.all([
      User.countDocuments(),
      Favorite.countDocuments(),
      Comment.countDocuments()
    ]);
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalFavorites,
        totalComments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy thống kê số lượng người dùng theo giới tính (male, female, other)
export const getGenderStats = async (req, res) => {
  try {
    const [male, female, other] = await Promise.all([
      User.countDocuments({ gender: "male" }),
      User.countDocuments({ gender: "female" }),
      User.countDocuments({ gender: "other" })
    ]);
    res.status(200).json({
      success: true,
      data: { male, female, other }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
