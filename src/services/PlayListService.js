import PlayListModel from "../app/Models/PlayListModel.js";
import UserModel from "../app/Models/UserModel.js";

// Lấy danh sách tất cả các playlist của người dùng
export const getUserPlaylists = async (userId) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return await PlayListModel.find({ userId });
};

// Tạo một playlist mới với giới hạn tối đa 5 danh sách
export const createPlaylist = async (userId, playListName) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const existingLists = await PlayListModel.countDocuments({ userId });
  if (existingLists >= 5) {
    throw new Error("Bạn đã đạt giới hạn số lượng danh sách (tối đa 5)");
  }

  const existingList = await PlayListModel.findOne({ userId, playListName });
  if (existingList) {
    throw new Error("Tên danh sách đã tồn tại");
  }

  return await PlayListModel.create({
    userId,
    playListName,
    movies: [],
  });
};

// Thêm phim vào playlist và kiểm tra sự tồn tại của phim
export const addMovieToPlaylist = async (userId, movieData) => {
  const { movieId, slug, playListName, movieName, thumb_url, poster_url } = movieData;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const playList = await PlayListModel.findOne({ userId, playListName });
  if (!playList) {
    throw new Error("Không tìm thấy danh sách");
  }

  const movieExists = playList.movies.some((movie) => movie.movieId === movieId);
  if (movieExists) {
    throw new Error("Phim đã có trong danh sách này");
  }

  playList.movies.push({
    movieId,
    movieName,
    slug,
    thumb_url,
    poster_url,
  });

  await playList.save();
  return playList;
};

// Đổi tên playlist
export const renamePlaylist = async (userId, renameData) => {
  const { oldPlayListName, newPlayListName } = renameData;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const existingList = await PlayListModel.findOne({
    userId,
    playListName: oldPlayListName,
  });

  if (!existingList) {
    throw new Error("Không tìm thấy danh sách");
  }

  if (oldPlayListName !== newPlayListName) {
    const duplicateName = await PlayListModel.findOne({
      userId,
      playListName: newPlayListName,
    });

    if (duplicateName) {
      throw new Error("Tên danh sách đã tồn tại");
    }
  }

  existingList.playListName = newPlayListName;
  await existingList.save();
  return existingList;
};

// Xóa danh sách playlist
export const deletePlaylist = async (userId, playListName) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const existingList = await PlayListModel.findOne({ userId, playListName });
  if (!existingList) {
    throw new Error("Không tìm thấy danh sách");
  }

  await PlayListModel.deleteOne({ userId, playListName });
};

// Xóa phim khỏi danh sách playlist
export const removeMovieFromPlaylist = async (userId, playlistData) => {
  const { playListName, movieId } = playlistData;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const playlist = await PlayListModel.findOne({ userId, playListName });
  if (!playlist) {
    throw new Error("Không tìm thấy danh sách phim");
  }

  playlist.movies = playlist.movies.filter((movie) => movie.movieId !== movieId);
  await playlist.save();
  return playlist;
};
