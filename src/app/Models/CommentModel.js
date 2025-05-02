import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    content: { type: String, required: true },
    movieName: { type: String, required: true },
    movieThumb: {
      type: String,
      required: true,
    },
    movieId: {
      type: String,
      required: true,
    },
    like: { type: Number, default: 0 },
    dislike: { type: Number, default: 0 },
    isSpoiler: { type: Boolean, default: true },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    dislikedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
      default: null,
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
      },
    ],
  },
  { timestamps: true }
);

const CommentModel = mongoose.model("comments", CommentSchema);

export default CommentModel;
