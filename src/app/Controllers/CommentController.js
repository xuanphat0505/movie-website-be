import CommentModel from "../Models/CommentModel.js";
import UserModel from "../Models/UserModel.js";
import RateModel from "../Models/RateModel.js";

export const createComment = async (req, res) => {  
  const userId = req.user._id;
  const { movieId, content, isSpoiler, movieName, parentId, movieThumb } = req.body;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = await CommentModel.create({
      userId,
      movieId,
      content,
      isSpoiler,
      movieName,
      movieThumb,
      parentId: parentId || null
    });

    // If this is a reply, update the parent comment
    if (parentId) {
      await CommentModel.findByIdAndUpdate(parentId, {
        $push: { replies: comment._id }
      });
    }

    await comment.save();
    return res.status(200).json({
      success: true,
      message: "Comment created successfully",
      data: comment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getComments = async (req, res) => {
  const movieId = req.params.movieId;
  try {
    const comments = await CommentModel.find({ 
      movieId: movieId,
      parentId: null // Only get top-level comments
    })
    .populate({
      path: 'userId',
      select: 'username avatar'
    })
    .populate({
      path: 'replies',
      populate: [
        {
          path: 'userId',
          select: 'username avatar'
        },
        {
          path: 'replies',
          populate: {
            path: 'userId',
            select: 'username avatar'
          }
        }
      ]
    })
    .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Get comments successfully",
      data: comments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getNewestComments = async (req, res) => {
  try {
    const comments = await CommentModel.find()
      .populate("userId")
      .sort({ createdAt: -1 })
      .limit(10);
    return res.status(200).json({
      success: true,
      message: "Get newest comments successfully",
      data: comments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const likeComment = async (req, res) => {
  const userId = req.user._id;
  const { commentId } = req.params;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    // Check if user already liked the comment
    const alreadyLiked = comment.likedBy.includes(userId);
    const alreadyDisliked = comment.dislikedBy.includes(userId);

    if (alreadyLiked) {
      // Remove like
      comment.like--;
      comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId.toString());
    } else {
      // Add like
      comment.like++;
      comment.likedBy.push(userId);
      
      // Remove dislike if exists
      if (alreadyDisliked) {
        comment.dislike--;
        comment.dislikedBy = comment.dislikedBy.filter(id => id.toString() !== userId.toString());
      }
    }

    await comment.save();
    return res.status(200).json({
      success: true,
      message: alreadyLiked ? "Comment unliked successfully" : "Comment liked successfully",
      data: {
        like: comment.like,
        dislike: comment.dislike,
        isLiked: !alreadyLiked,
        isDisliked: false
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const dislikeComment = async (req, res) => {
  const userId = req.user._id;
  const { commentId } = req.params;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    // Check if user already disliked the comment
    const alreadyDisliked = comment.dislikedBy.includes(userId);
    const alreadyLiked = comment.likedBy.includes(userId);

    if (alreadyDisliked) {
      // Remove dislike
      comment.dislike--;
      comment.dislikedBy = comment.dislikedBy.filter(id => id.toString() !== userId.toString());
    } else {
      // Add dislike
      comment.dislike++;
      comment.dislikedBy.push(userId);
      
      // Remove like if exists
      if (alreadyLiked) {
        comment.like--;
        comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId.toString());
      }
    }

    await comment.save();
    return res.status(200).json({
      success: true,
      message: alreadyDisliked ? "Comment undisliked successfully" : "Comment disliked successfully",
      data: {
        like: comment.like,
        dislike: comment.dislike,
        isLiked: false,
        isDisliked: !alreadyDisliked
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopComments = async (req, res) => {
  try {
    // Get comments for the movie
    const comments = await CommentModel.find()
      .populate("userId", "username avatar")

    // Calculate total interactions (likes + replies) for each comment
    const commentsWithInteractions = comments.map((comment) => ({
      ...comment.toObject(),
      totalInteractions: comment.like + comment.replies.length,
    }));

    // Sort by total interactions in descending order
    const sortedComments = commentsWithInteractions.sort(
      (a, b) => b.totalInteractions - a.totalInteractions
    );

    // Get top 10 comments
    const topComments = sortedComments.slice(0, 10);

    res.status(200).json({
      success: true,
      data: topComments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};