import WatchHistoryModel from "../Models/WatchHistoryModel.js";

export const getWatchHistory = async (req, res) => {
  const userId = req.user._id;
  try {
    const history = await WatchHistoryModel.find({ userId })
      .sort({
        updatedAt: -1,
      })
      .limit(20);
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatedWatchHistory = async (req, res) => {
  const userId = req.user._id;
  const {
    movieId,
    slug,
    name,
    thumb_url,
    poster_url,
    lang,
    currentTime,
    duration,
    progressPercent,
    episode,
  } = req.body;
  try {
    const updatedHistory = await WatchHistoryModel.findOneAndUpdate(
      { userId, slug },
      {
        userId,
        movieId,
        slug,
        name,
        thumb_url,
        poster_url,
        lang,
        currentTime,
        duration,
        progressPercent,
        episode,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    return res.status(200).json({ success: true, data: updatedHistory });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteWatchHistory = async (req, res) => {
  const userId = req.user._id;
  const { slug } = req.params;
  try {
    await WatchHistoryModel.findOneAndDelete({ userId, slug });
    return res
      .status(200)
      .json({ success: true, message: "Xóa lịch sử xem phim thành công" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWatchHistory = async (req, res) => {
  const userId = req.user._id;
  try {
    const {
      movieId,
      slug,
      name,
      thumb_url,
      poster_url,
      lang,
      currentTime,
      duration,
      progressPercent,
      episode,
    } = req.body;

    // Kiểm tra dữ liệu cần thiết
    if (!movieId || !slug) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: movieId or slug",
      });
    }

    // Sửa lỗi: Phải tìm theo điều kiện {userId, slug} thay vì chỉ {userId}
    // Đảm bảo chỉ cập nhật đúng bản ghi của người dùng và phim cụ thể
    const updateResult = await WatchHistoryModel.findOneAndUpdate(
      { userId, slug }, // Tìm theo cả userId VÀ slug
      {
        userId,
        movieId,
        slug,
        name,
        thumb_url,
        poster_url,
        lang,
        currentTime,
        duration,
        progressPercent,
        episode,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: updateResult,
    });
  } catch (error) {
    console.error("Error updating watch history:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
