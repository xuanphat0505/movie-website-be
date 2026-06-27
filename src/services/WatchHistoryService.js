import WatchHistoryModel from "../app/Models/WatchHistoryModel.js";

// Lấy danh sách 20 phim đã xem gần đây nhất của người dùng
export const getWatchHistory = async (userId) => {
  return await WatchHistoryModel.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(20);
};

// Cập nhật hoặc thêm mới lịch sử xem phim
export const updateWatchHistory = async (userId, historyData) => {
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
  } = historyData;

  if (!movieId || !slug) {
    throw new Error("Missing required fields: movieId or slug");
  }

  return await WatchHistoryModel.findOneAndUpdate(
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
};

// Xóa lịch sử xem một bộ phim cụ thể bằng slug
export const deleteWatchHistory = async (userId, slug) => {
  await WatchHistoryModel.findOneAndDelete({ userId, slug });
};
