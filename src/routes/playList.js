import express from "express";
import { verifyToken } from "../middlewares/verify.js";
import {
  gerPlayList,
  createPlayList,
  addPlayList,
  updatePlayList,
  deletePlayList,
  removeMovieFromPlayList,
} from "../app/Controllers/PlayListController.js";

const router = express.Router();

router.get("/", verifyToken, gerPlayList);
router.post("/create", verifyToken, createPlayList);
router.post("/add", verifyToken, addPlayList);
router.put("/update", verifyToken, updatePlayList);
router.delete("/delete", verifyToken, deletePlayList);
router.delete("/remove", verifyToken, removeMovieFromPlayList);

export default router;
