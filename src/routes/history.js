import express from "express";
import {
  getWatchHistory,
  updatedWatchHistory,
  deleteWatchHistory,
} from "../app/Controllers/WatchHistoryController.js";
import { verifyToken } from "../middlewares/verify.js";

const router = express.Router();

router.get("/", verifyToken, getWatchHistory);
router.post("/", verifyToken, updatedWatchHistory);
router.delete("/:slug", verifyToken, deleteWatchHistory);

export default router;
