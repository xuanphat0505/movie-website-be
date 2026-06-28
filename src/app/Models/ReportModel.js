import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    movieId: {
      type: String,
      required: true,
    },
    movieName: {
      type: String,
      required: true,
    },
    episodeName: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: [
        "video_error",
        "audio_error",
        "subtitle_error",
        "content_violation",
        "other",
      ],
      required: true,
    },
    note: {
      type: String,
      default: "",
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "resolving", "resolved", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
