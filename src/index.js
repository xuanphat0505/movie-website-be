import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import historyRoutes from "./routes/history.js";
import playListRoutes from "./routes/playList.js";
import favoriteRoutes from "./routes/favorite.js";
import healthCheckRoutes from "./routes/health-check.js";
import commentRoutes from "./routes/comment.js";
import rateRoutes from "./routes/rate.js";
import notificationRoutes from "./routes/notification.js";
import analyticsRoutes from "./routes/analytics.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();
const httpServer = createServer(app);

// middlewares - IMPORTANT: These need to be before routes
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io available to our routes
app.set("io", io);

// Socket connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

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

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/history", historyRoutes);
app.use("/api/v1/play-list", playListRoutes);
app.use("/api/v1/favorite", favoriteRoutes);
app.use("/api/v1/health-check", healthCheckRoutes);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/rate", rateRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/admin", adminRoutes);

// Start server
httpServer.listen(port, () => {
  connectDB();
  console.log(`connect server on port ${port}`);

});
