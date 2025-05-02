import RateModel from "../Models/RateModel.js";
import UserModel from "../Models/UserModel.js";

export const createRate = async (req, res) => {
  const userId = req.user._id;
  const { movieId, content, rateMark } = req.body;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const rate = await RateModel.create({
      userId,
      movieId,
      content,
      rateMark,
    });
    return res
      .status(200)
      .json({ message: "Rate created successfully", data: rate });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getRate = async (req, res) => {
  const { movieId } = req.params;
  try {
    const rate = await RateModel.find({ movieId }).populate({
      path: "userId",
      select: "username avatar",
    });
    return res
      .status(200)
      .json({ message: "Rate fetched successfully", data: rate });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const likeRate = async (req, res) => {
  const userId = req.user._id;
  const { rateId } = req.params;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const rate = await RateModel.findById(rateId);
    if (!rate) {
      return res
        .status(404)
        .json({ success: false, message: "Rate not found" });
    }

    // Check if user already liked the comment
    const alreadyLiked = rate.likedBy.includes(userId);
    const alreadyDisliked = rate.dislikedBy.includes(userId);

    if (alreadyLiked) {
      // Remove like
      rate.like--;
      rate.likedBy = rate.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Add like
      rate.like++;
      rate.likedBy.push(userId);

      // Remove dislike if exists
      if (alreadyDisliked) {
        rate.dislike--;
        rate.dislikedBy = rate.dislikedBy.filter(
          (id) => id.toString() !== userId.toString()
        );
      }
    }

    await rate.save();
    return res.status(200).json({
      success: true,
      message: alreadyLiked
        ? "Rate unliked successfully"
        : "Rate liked successfully",
      data: {
        like: rate.like,
        dislike: rate.dislike,
        isLiked: !alreadyLiked,
        isDisliked: false,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const dislikeRate = async (req, res) => {
  const userId = req.user._id;
  const { rateId } = req.params;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const rate = await RateModel.findById(rateId);
    if (!rate) {
      return res
        .status(404)
        .json({ success: false, message: "Rate not found" });
    }

    // Check if user already disliked the comment
    const alreadyDisliked = rate.dislikedBy.includes(userId);
    const alreadyLiked = rate.likedBy.includes(userId);

    if (alreadyDisliked) {
      // Remove dislike
      rate.dislike--;
      rate.dislikedBy = rate.dislikedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Add dislike
      rate.dislike++;
      rate.dislikedBy.push(userId);

      // Remove like if exists
      if (alreadyLiked) {
        rate.like--;
        rate.likedBy = rate.likedBy.filter(
          (id) => id.toString() !== userId.toString()
        );
      }
    }

    await rate.save();
    return res.status(200).json({
      success: true,
      message: alreadyDisliked
        ? "Rate undisliked successfully"
        : "Rate disliked successfully",
      data: {
        like: rate.like,
        dislike: rate.dislike,
        isLiked: false,
        isDisliked: !alreadyDisliked,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
