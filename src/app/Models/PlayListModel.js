import mongoose from "mongoose";

// Schema cho danh sách phim
const PlayListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    playListName: {
      type: String,
      required: true,
    },
    movies: [{
      movieId: {
        type: String,
        required: true,
      },
      movieName: {
        type: String,
        required: true,
      },
      slug: {
        type: String,
        required: true,
      },
      thumb_url: String,
      poster_url: String,
    }]
  },
  { timestamps: true }
);

const PlayListModel = mongoose.model("play-lists", PlayListSchema);

export default PlayListModel;
