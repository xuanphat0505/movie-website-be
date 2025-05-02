import PlayListModel from "../Models/PlayListModel.js";
import UserModel from "../Models/UserModel.js";

export const gerPlayList = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const playLists = await PlayListModel.find({ userId });
    return res.status(200).json({ success: true, data: playLists });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPlayList = async (req, res) => {
  const userId = req.user._id;
  const { playListName } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingLists = await PlayListModel.countDocuments({ userId });
    if (existingLists >= 5) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đạt giới hạn số lượng danh sách (tối đa 5)",
      });
    }

    const existingList = await PlayListModel.findOne({
      userId,
      playListName,
    });
    if (existingList) {
      return res.status(400).json({
        success: false,
        message: "Tên danh sách đã tồn tại",
      });
    }

    const playList = await PlayListModel.create({
      userId,
      playListName,
      movies: [],
    });

    return res.status(201).json({
      success: true,
      data: playList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addPlayList = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { movieId, slug, playListName, movieName, thumb_url, poster_url } =
      req.body;

    const playList = await PlayListModel.findOne({
      userId,
      playListName,
    });

    if (!playList) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh sách",
      });
    }

    const movieExists = playList.movies.some(
      (movie) => movie.movieId === movieId
    );
    if (movieExists) {
      return res.status(400).json({
        success: false,
        message: "Phim đã có trong danh sách này",
      });
    }

    playList.movies.push({
      movieId,
      movieName,
      slug,
      thumb_url,
      poster_url,
    });

    await playList.save();

    return res.status(200).json({
      success: true,
      data: playList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePlayList = async (req, res) => {
  const userId = req.user._id;
  const { oldPlayListName, newPlayListName } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingList = await PlayListModel.findOne({
      userId,
      playListName: oldPlayListName,
    });

    if (!existingList) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh sách",
      });
    }

    if (oldPlayListName !== newPlayListName) {
      const duplicateName = await PlayListModel.findOne({
        userId,
        playListName: newPlayListName,
      });

      if (duplicateName) {
        return res.status(400).json({
          success: false,
          message: "Tên danh sách đã tồn tại",
        });
      }
    }

    existingList.playListName = newPlayListName;
    await existingList.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật danh sách thành công",
      data: existingList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePlayList = async (req, res) => {
  const userId = req.user._id;
  const { playListName } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingList = await PlayListModel.findOne({
      userId,
      playListName,
    });

    if (!existingList) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh sách",
      });
    }

    await PlayListModel.deleteOne({ userId, playListName });

    return res.status(200).json({
      success: true,
      message: "Xóa danh sách thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeMovieFromPlayList = async (req, res) => {
  const userId = req.user._id;
  const { playListName, movieId } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const playlist = await PlayListModel.findOne({ 
      userId, 
      playListName 
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh sách phim",
      });
    }

    playlist.movies = playlist.movies.filter(movie => movie.movieId !== movieId);
    await playlist.save();

    return res.status(200).json({
      success: true,
      message: "Xóa phim khỏi danh sách thành công",
      data: playlist
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
