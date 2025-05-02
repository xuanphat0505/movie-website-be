import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import historyRoutes from "./routes/history.js";
import playListRoutes from "./routes/playList.js";
import favoriteRoutes from "./routes/favorite.js";
import healthCheckRoutes from "./routes/health-check.js";
import commentRoutes from "./routes/comment.js";
import rateRoutes from "./routes/rate.js";

dotenv.config();


const port = process.env.PORT || 8000;
const app = express();


// connect database
mongoose.set("strictQuery", false);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_URL);
    console.log("connect database successful");
  } catch (error) {
    console.log("connect database failed:", error.message);
  }
};

// middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());


// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/history", historyRoutes);
app.use("/api/v1/play-list", playListRoutes);
app.use("/api/v1/favorite", favoriteRoutes);
app.use("/api/v1/health-check", healthCheckRoutes);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/rate", rateRoutes);

app.listen(port, () => {
    connectDB();
    console.log(`connect sever on port ${port}`);
  });


