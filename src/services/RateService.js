import RateModel from "../app/Models/RateModel.js";
import UserModel from "../app/Models/UserModel.js";

// Tạo đánh giá mới cho phim
export const createRate = async (userId, rateData) => {
  const { movieId, content, rateMark } = rateData;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return await RateModel.create({
    userId,
    movieId,
    content,
    rateMark,
  });
};

// Lấy danh sách đánh giá của một bộ phim
export const getRatesByMovie = async (movieId) => {
  return await RateModel.find({ movieId }).populate({
    path: "userId",
    select: "username avatar",
  });
};

// Thích/hủy thích đánh giá
export const likeRateToggle = async (rateId, userId) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const rate = await RateModel.findById(rateId);
  if (!rate) {
    throw new Error("Rate not found");
  }

  const alreadyLiked = rate.likedBy.includes(userId);
  const alreadyDisliked = rate.dislikedBy.includes(userId);

  if (alreadyLiked) {
    rate.like--;
    rate.likedBy = rate.likedBy.filter((id) => id.toString() !== userId.toString());
  } else {
    rate.like++;
    rate.likedBy.push(userId);

    if (alreadyDisliked) {
      rate.dislike--;
      rate.dislikedBy = rate.dislikedBy.filter((id) => id.toString() !== userId.toString());
    }
  }

  await rate.save();
  return {
    like: rate.like,
    dislike: rate.dislike,
    isLiked: !alreadyLiked,
    isDisliked: false,
    message: alreadyLiked ? "Rate unliked successfully" : "Rate liked successfully",
  };
};

// Không thích/hủy không thích đánh giá
export const dislikeRateToggle = async (rateId, userId) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const rate = await RateModel.findById(rateId);
  if (!rate) {
    throw new Error("Rate not found");
  }

  const alreadyDisliked = rate.dislikedBy.includes(userId);
  const alreadyLiked = rate.likedBy.includes(userId);

  if (alreadyDisliked) {
    rate.dislike--;
    rate.dislikedBy = rate.dislikedBy.filter((id) => id.toString() !== userId.toString());
  } else {
    rate.dislike++;
    rate.dislikedBy.push(userId);

    if (alreadyLiked) {
      rate.like--;
      rate.likedBy = rate.likedBy.filter((id) => id.toString() !== userId.toString());
    }
  }

  await rate.save();
  return {
    like: rate.like,
    dislike: rate.dislike,
    isLiked: false,
    isDisliked: !alreadyDisliked,
    message: alreadyDisliked ? "Rate undisliked successfully" : "Rate disliked successfully",
  };
};
