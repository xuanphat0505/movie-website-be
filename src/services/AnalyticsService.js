import User from "../app/Models/UserModel.js";
import Favorite from "../app/Models/FavoriteModel.js";
import Comment from "../app/Models/CommentModel.js";

// Lấy tổng số lượng tài khoản hoạt động
export const getActiveUsersCount = async () => {
  return await User.countDocuments({ status: "active" });
};

// Lấy số lượng người dùng nam
export const getMaleUsersCount = async () => {
  return await User.countDocuments({ gender: "male" });
};

// Lấy số lượng người dùng nữ
export const getFemaleUsersCount = async () => {
  return await User.countDocuments({ gender: "female" });
};

// Lấy tổng số lượng tất cả người dùng trong hệ thống
export const getTotalUsersCount = async () => {
  return await User.countDocuments();
};

// Lấy thống kê tổng quan các chỉ số cơ bản của trang quản trị
export const getOverviewStatsData = async () => {
  const [totalUsers, totalFavorites, totalComments] = await Promise.all([
    User.countDocuments(),
    Favorite.countDocuments(),
    Comment.countDocuments(),
  ]);
  return { totalUsers, totalFavorites, totalComments };
};

// Lấy thống kê phân bố số người dùng theo giới tính
export const getGenderStatsData = async () => {
  const [male, female, other] = await Promise.all([
    User.countDocuments({ gender: "male" }),
    User.countDocuments({ gender: "female" }),
    User.countDocuments({ gender: "other" }),
  ]);
  return { male, female, other };
};
