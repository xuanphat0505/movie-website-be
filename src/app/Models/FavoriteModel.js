import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    movies: [
      {
        movieId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        slug: {
          type: String,
          required: true,
        },
        poster_url: {
          type: String,
        },
        thumb_url: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const FavoriteModel = mongoose.model("favorites", favoriteSchema);

export default FavoriteModel;
