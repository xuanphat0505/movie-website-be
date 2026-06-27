import * as PlayListService from "../../services/PlayListService.js";

// Lấy danh sách playlist của người dùng thông
export const gerPlayList = async (req, res) => {
  const userId = req.user._id;
  try {
    const playLists = await PlayListService.getUserPlaylists(userId);
    return res.status(200).json({ success: true, data: playLists });
  } catch (error) {
    return res.status(error.message.includes("User not found") ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Tạo playlist mới thông
export const createPlayList = async (req, res) => {
  const userId = req.user._id;
  const { playListName } = req.body;

  try {
    const playList = await PlayListService.createPlaylist(userId, playListName);
    return res.status(201).json({
      success: true,
      data: playList,
    });
  } catch (error) {
    const status = error.message.includes("User not found")
      ? 404
      : error.message.includes("giới hạn") || error.message.includes("tồn tại")
      ? 400
      : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// Thêm phim vào playlist thông
export const addPlayList = async (req, res) => {
  const userId = req.user._id;
  try {
    const playList = await PlayListService.addMovieToPlaylist(userId, req.body);
    return res.status(200).json({
      success: true,
      data: playList,
    });
  } catch (error) {
    const status = error.message.includes("not found") || error.message.includes("Không tìm thấy")
      ? 404
      : error.message.includes("đã có")
      ? 400
      : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật tên playlist thông
export const updatePlayList = async (req, res) => {
  const userId = req.user._id;

  try {
    const existingList = await PlayListService.renamePlaylist(userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Cập nhật danh sách thành công",
      data: existingList,
    });
  } catch (error) {
    const status = error.message.includes("User not found") || error.message.includes("Không tìm thấy")
      ? 404
      : error.message.includes("tồn tại")
      ? 400
      : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa danh sách playlist thông
export const deletePlayList = async (req, res) => {
  const userId = req.user._id;
  const { playListName } = req.body;

  try {
    await PlayListService.deletePlaylist(userId, playListName);
    return res.status(200).json({
      success: true,
      message: "Xóa danh sách thành công",
    });
  } catch (error) {
    return res.status(error.message.includes("not found") || error.message.includes("Không tìm thấy") ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa phim khỏi danh sách playlist thông
export const removeMovieFromPlayList = async (req, res) => {
  const userId = req.user._id;

  try {
    const playlist = await PlayListService.removeMovieFromPlaylist(userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Xóa phim khỏi danh sách thành công",
      data: playlist
    });
  } catch (error) {
    return res.status(error.message.includes("not found") || error.message.includes("Không tìm thấy") ? 404 : 500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
