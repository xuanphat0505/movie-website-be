import * as FavoriteService from "../../services/FavoriteService.js";

// Lấy danh sách yêu thích của người dùng thông
export const getFavorites = async (req, res) => {
  const userId = req.user._id;
  try {
    const movies = await FavoriteService.getFavorites(userId);
    return res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    return res
      .status(error.message.includes("User not found") ? 404 : 500)
      .json({
        success: false,
        message: error.message,
      });
  }
};

// Xóa phim khỏi danh sách yêu thích thông
export const removeFromFavorites = async (req, res) => {
  const userId = req.user._id;
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin phim cần xóa",
    });
  }

  try {
    const movies = await FavoriteService.removeFromFavorites(userId, slug);
    return res.status(200).json({
      success: true,
      message: "Đã xóa khỏi danh sách yêu thích",
      data: movies,
    });
  } catch (error) {
    const isNotFound =
      error.message.includes("User not found") ||
      error.message.includes("Không tìm thấy");
    return res.status(isNotFound ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Thêm hoặc xóa phim khỏi danh sách yêu thích
export const toggleFavorite = async (req, res) => {
  const userId = req.user._id;
  const { movieId, slug, name } = req.body;

  if (!movieId || !slug || !name) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin phim",
    });
  }

  try {
    const result = await FavoriteService.toggleFavorite(userId, req.body);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.movies,
      action: result.action,
    });
  } catch (error) {
    return res
      .status(error.message.includes("User not found") ? 404 : 500)
      .json({
        success: false,
        message: error.message,
      });
  }
};
