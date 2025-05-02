import express from "express";
import {
  createComment,
  getComments,
  getNewestComments,
  likeComment,
  dislikeComment,
  getTopComments,
} from "../app/Controllers/CommentController.js";
import { verifyToken } from "../middlewares/verify.js";

const router = express.Router();

router.get("/newest", getNewestComments);
router.get("/top", getTopComments);
router.post("/create", verifyToken, createComment);
router.put("/like/:commentId", verifyToken, likeComment);
router.put("/dislike/:commentId", verifyToken, dislikeComment);
router.get("/:movieId", getComments);

export default router;
