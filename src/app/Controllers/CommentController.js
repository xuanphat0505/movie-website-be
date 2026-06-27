import * as CommentService from "../../services/CommentService.js";

// Tạo bình luận mới thông
export const createComment = async (req, res) => {
  const userId = req.user._id;
  try {
    const comment = await CommentService.createComment(userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Comment created successfully",
      data: comment,
    });
  } catch (error) {
    return res
      .status(error.message.includes("User not found") ? 404 : 500)
      .json({
        success: false,
        message: error.message,
      });
  }
};

// Lấy danh sách bình luận của một bộ phim
export const getComments = async (req, res) => {
  const movieId = req.params.movieId;
  try {
    const comments = await CommentService.getCommentsByMovie(movieId);
    return res.status(200).json({
      success: true,
      message: "Get comments successfully",
      data: comments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách các bình luận mới nhất
export const getNewestComments = async (req, res) => {
  try {
    const comments = await CommentService.getNewestCommentsList();
    return res.status(200).json({
      success: true,
      message: "Get newest comments successfully",
      data: comments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Thích/hủy thích bình luận thông
export const likeComment = async (req, res) => {
  const userId = req.user._id;
  const { commentId } = req.params;
  try {
    const result = await CommentService.likeCommentToggle(commentId, userId);
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
    return res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Không thích/hủy không thích bình luận thông
export const dislikeComment = async (req, res) => {
  const userId = req.user._id;
  const { commentId } = req.params;
  try {
    const result = await CommentService.dislikeCommentToggle(commentId, userId);
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
    return res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy danh sách bình luận tương tác cao nhất
export const getTopComments = async (req, res) => {
  try {
    const topComments = await CommentService.getTopInteractedComments();
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
