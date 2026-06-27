import * as WatchHistoryService from "../../services/WatchHistoryService.js";

// Lấy danh sách phim đã xem 
export const getWatchHistory = async (req, res) => {
  const userId = req.user._id;
  try {
    const history = await WatchHistoryService.getWatchHistory(userId);
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật lịch sử xem 
export const updatedWatchHistory = async (req, res) => {
  const userId = req.user._id;
  try {
    const updatedHistory = await WatchHistoryService.updateWatchHistory(userId, req.body);
    return res.status(200).json({ success: true, data: updatedHistory });
  } catch (error) {
    const status = error.message.includes("Missing required fields") ? 400 : 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

// Xóa lịch sử xem phim 
export const deleteWatchHistory = async (req, res) => {
  const userId = req.user._id;
  const { slug } = req.params;
  try {
    await WatchHistoryService.deleteWatchHistory(userId, slug);
    return res
      .status(200)
      .json({ success: true, message: "Xóa lịch sử xem phim thành công" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Hàm phụ cập nhật lịch sử xem
export const updateWatchHistory = async (req, res) => {
  const userId = req.user._id;
  try {
    const updateResult = await WatchHistoryService.updateWatchHistory(userId, req.body);
    res.status(200).json({
      success: true,
      data: updateResult,
    });
  } catch (error) {
    console.error("Error updating watch history:", error);
    const status = error.message.includes("Missing required fields") ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};
