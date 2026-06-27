import FavoriteModel from "../app/Models/FavoriteModel.js";
import UserModel from "../app/Models/UserModel.js";

// Lấy danh sách yêu thích của người dùng hoặc tự khởi tạo nếu chưa có
export const getFavorites = async (userId) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  let favorites = await FavoriteModel.findOne({ userId });
  if (!favorites) {
    favorites = new FavoriteModel({ userId, movies: [] });
    await favorites.save();
  }

  return favorites.movies || [];
};

// Xóa một bộ phim khỏi danh sách yêu thích bằng slug
export const removeFromFavorites = async (userId, slug) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  let favorites = await FavoriteModel.findOne({ userId });
  if (!favorites || !favorites.movies.length) {
    throw new Error("Không tìm thấy danh sách yêu thích");
  }

  const movieExists = favorites.movies.some((movie) => movie.slug === slug);
  if (!movieExists) {
    throw new Error("Không tìm thấy phim trong danh sách yêu thích");
  }

  favorites.movies = favorites.movies.filter((movie) => movie.slug !== slug);
  await favorites.save();

  return favorites.movies;
};

// Thêm phim vào hoặc xóa phim khỏi danh sách yêu thích (toggle)
export const toggleFavorite = async (userId, movieData) => {
  const { movieId, slug, name, thumb_url, poster_url } = movieData;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  let favorites = await FavoriteModel.findOne({ userId });
  if (!favorites) {
    favorites = new FavoriteModel({ userId, movies: [] });
  }

  const movieExists = favorites.movies.some((movie) => movie.slug === slug);

  if (movieExists) {
    favorites.movies = favorites.movies.filter((movie) => movie.slug !== slug);
    await favorites.save();
    return {
      movies: favorites.movies,
      action: "removed",
      message: "Đã xóa khỏi danh sách yêu thích",
    };
  } else {
    favorites.movies.push({
      movieId,
      slug,
      name,
      thumb_url,
      poster_url,
    });
    await favorites.save();
    return {
      movies: favorites.movies,
      action: "added",
      message: "Đã thêm vào danh sách yêu thích",
    };
  }
};
