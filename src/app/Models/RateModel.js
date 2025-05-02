import mongoose from "mongoose";

const RateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    content: { type: String, required: true },
    movieId: {
      type: String,
      required: true,
    },
    rateMark: { type: Number, required: true },
    like: { type: Number, default: 0 },
    dislike: { type: Number, default: 0 },
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
  },
  { timestamps: true }
);

const RateModel = mongoose.model("rates", RateSchema);

export default RateModel;
