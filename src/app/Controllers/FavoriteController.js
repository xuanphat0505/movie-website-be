import FavoriteModel from "../Models/FavoriteModel.js";
import UserModel from "../Models/UserModel.js";

// Lấy danh sách yêu thích của người dùng
export const getFavorites = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let favorites = await FavoriteModel.findOne({ userId });
    if (!favorites) {
      // Nếu chưa có danh sách yêu thích, tạo mới
      favorites = new FavoriteModel({ userId, movies: [] });
      await favorites.save();
    }

    return res.status(200).json({ 
      success: true, 
      data: favorites.movies || [] 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa phim khỏi danh sách yêu thích
export const removeFromFavorites = async (req, res) => {
  const userId = req.user._id;
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin phim cần xóa"
    });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let favorites = await FavoriteModel.findOne({ userId });
    if (!favorites || !favorites.movies.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh sách yêu thích"
      });
    }

    // Kiểm tra xem phim có tồn tại trong danh sách không
    const movieExists = favorites.movies.some(movie => movie.slug === slug);
    if (!movieExists) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phim trong danh sách yêu thích"
      });
    }

    // Xóa phim khỏi danh sách
    favorites.movies = favorites.movies.filter(movie => movie.slug !== slug);
    await favorites.save();

    return res.status(200).json({
      success: true,
      message: "Đã xóa khỏi danh sách yêu thích",
      data: favorites.movies
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm phim vào danh sách yêu thích
export const toggleFavorite = async (req, res) => {
  const userId = req.user._id;
  const { movieId, slug, name, thumb_url, poster_url } = req.body;

  if (!movieId || !slug || !name) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin phim"
    });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let favorites = await FavoriteModel.findOne({ userId });
    if (!favorites) {
      // Nếu chưa có danh sách yêu thích, tạo mới
      favorites = new FavoriteModel({ userId, movies: [] });
    }

    // Kiểm tra xem phim đã tồn tại trong danh sách chưa
    const movieExists = favorites.movies.some(movie => movie.slug === slug);
    
    if (movieExists) {
      // Nếu phim đã tồn tại, xóa khỏi danh sách
      favorites.movies = favorites.movies.filter(movie => movie.slug !== slug);
      await favorites.save();
      
      return res.status(200).json({
        success: true,
        message: "Đã xóa khỏi danh sách yêu thích",
        data: favorites.movies,
        action: "removed"
      });
    } else {
      // Nếu phim chưa tồn tại, thêm vào danh sách
      favorites.movies.push({ 
        movieId, 
        slug, 
        name, 
        thumb_url, 
        poster_url 
      });
      await favorites.save();
      
      return res.status(200).json({
        success: true,
        message: "Đã thêm vào danh sách yêu thích",
        data: favorites.movies,
        action: "added"
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
