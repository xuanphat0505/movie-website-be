import express from "express";
import {
    createRate,
    getRate,
    likeRate,
    dislikeRate,
} from "../app/Controllers/RateController.js";
import { verifyToken } from "../middlewares/verify.js";
const router = express.Router();

router.post("/create", verifyToken, createRate);
router.get("/:movieId", getRate);
router.put("/like/:rateId", verifyToken, likeRate);
router.put("/dislike/:rateId", verifyToken, dislikeRate);

export default router;
