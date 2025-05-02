import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    movieId: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    thumb_url: String,
    poster_url: String,
    lang: String,
    currentTime: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    progressPercent: {
      type: Number,
      required: true,
    },
    episode: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true }
);

watchHistorySchema.index({ userId: 1, slug: 1 }, { unique: true });

const WatchHisoryModel = mongoose.model("history-movies", watchHistorySchema);

export default WatchHisoryModel;
