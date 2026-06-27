import CommentModel from "../app/Models/CommentModel.js";
import UserModel from "../app/Models/UserModel.js";

// Tạo bình luận mới hoặc phản hồi bình luận khác
export const createComment = async (userId, commentData) => {
  const { movieId, content, isSpoiler, movieName, parentId, movieThumb } = commentData;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const comment = await CommentModel.create({
    userId,
    movieId,
    content,
    isSpoiler,
    movieName,
    movieThumb,
    parentId: parentId || null,
  });

  if (parentId) {
    await CommentModel.findByIdAndUpdate(parentId, {
      $push: { replies: comment._id },
    });
  }

  await comment.save();
  return comment;
};

// Lấy danh sách bình luận của một bộ phim bao gồm cả phản hồi
export const getCommentsByMovie = async (movieId) => {
  return await CommentModel.find({
    movieId,
    parentId: null,
  })
    .populate({
      path: "userId",
      select: "username avatar",
    })
    .populate({
      path: "replies",
      populate: [
        {
          path: "userId",
          select: "username avatar",
        },
        {
          path: "replies",
          populate: {
            path: "userId",
            select: "username avatar",
          },
        },
      ],
    })
    .sort({ createdAt: -1 });
};

// Lấy danh sách 10 bình luận mới nhất toàn hệ thống
export const getNewestCommentsList = async () => {
  return await CommentModel.find()
    .populate("userId")
    .sort({ createdAt: -1 })
    .limit(10);
};

// Thích hoặc hủy thích bình luận, đồng thời gỡ bỏ lượt không thích nếu có
export const likeCommentToggle = async (commentId, userId) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const comment = await CommentModel.findById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  const alreadyLiked = comment.likedBy.includes(userId);
  const alreadyDisliked = comment.dislikedBy.includes(userId);

  if (alreadyLiked) {
    comment.like--;
    comment.likedBy = comment.likedBy.filter((id) => id.toString() !== userId.toString());
  } else {
    comment.like++;
    comment.likedBy.push(userId);

    if (alreadyDisliked) {
      comment.dislike--;
      comment.dislikedBy = comment.dislikedBy.filter((id) => id.toString() !== userId.toString());
    }
  }

  await comment.save();
  return {
    like: comment.like,
    dislike: comment.dislike,
    isLiked: !alreadyLiked,
    isDisliked: false,
    message: alreadyLiked ? "Comment unliked successfully" : "Comment liked successfully",
  };
};

// Không thích hoặc hủy không thích bình luận, đồng thời gỡ bỏ lượt thích nếu có
export const dislikeCommentToggle = async (commentId, userId) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const comment = await CommentModel.findById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  const alreadyDisliked = comment.dislikedBy.includes(userId);
  const alreadyLiked = comment.likedBy.includes(userId);

  if (alreadyDisliked) {
    comment.dislike--;
    comment.dislikedBy = comment.dislikedBy.filter((id) => id.toString() !== userId.toString());
  } else {
    comment.dislike++;
    comment.dislikedBy.push(userId);

    if (alreadyLiked) {
      comment.like--;
      comment.likedBy = comment.likedBy.filter((id) => id.toString() !== userId.toString());
    }
  }

  await comment.save();
  return {
    like: comment.like,
    dislike: comment.dislike,
    isLiked: false,
    isDisliked: !alreadyDisliked,
    message: alreadyDisliked ? "Comment undisliked successfully" : "Comment disliked successfully",
  };
};

// Lấy danh sách 10 bình luận nổi bật nhất dựa trên tổng số lượt thích và phản hồi
export const getTopInteractedComments = async () => {
  const comments = await CommentModel.find().populate("userId", "username avatar");

  const commentsWithInteractions = comments.map((comment) => ({
    ...comment.toObject(),
    totalInteractions: comment.like + comment.replies.length,
  }));

  const sortedComments = commentsWithInteractions.sort(
    (a, b) => b.totalInteractions - a.totalInteractions
  );

  return sortedComments.slice(0, 10);
};
