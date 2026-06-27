import * as RateService from "../../services/RateService.js";

// Tạo đánh giá thông
export const createRate = async (req, res) => {
  const userId = req.user._id;
  try {
    const rate = await RateService.createRate(userId, req.body);
    return res
      .status(200)
      .json({ message: "Rate created successfully", data: rate });
  } catch (error) {
    return res.status(error.message.includes("User not found") ? 400 : 500).json({ message: error.message });
  }
};

// Lấy danh sách đánh giá
export const getRate = async (req, res) => {
  const { movieId } = req.params;
  try {
    const rate = await RateService.getRatesByMovie(movieId);
    return res
      .status(200)
      .json({ message: "Rate fetched successfully", data: rate });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Thích/hủy thích đánh giá thông
export const likeRate = async (req, res) => {
  const userId = req.user._id;
  const { rateId } = req.params;
  try {
    const result = await RateService.likeRateToggle(rateId, userId);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        like: result.like,
        dislike: result.dislike,
        isLiked: result.isLiked,
        isDisliked: result.isDisliked,
      },
    });
  } catch (error) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({ success: false, message: error.message });
  }
};

// Không thích/hủy không thích đánh giá thông
export const dislikeRate = async (req, res) => {
  const userId = req.user._id;
  const { rateId } = req.params;
  try {
    const result = await RateService.dislikeRateToggle(rateId, userId);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        like: result.like,
        dislike: result.dislike,
        isLiked: result.isLiked,
        isDisliked: result.isDisliked,
      },
    });
  } catch (error) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({ success: false, message: error.message });
  }
};
