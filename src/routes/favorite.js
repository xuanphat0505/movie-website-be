import express from "express";
const router = express.Router();

import { getFavorites, toggleFavorite, removeFromFavorites } from "../app/Controllers/FavoriteController.js";
import { verifyToken } from "../middlewares/verify.js";

router.get("/", verifyToken, getFavorites);
router.post("/toggle", verifyToken, toggleFavorite);
router.delete("/remove/:slug", verifyToken, removeFromFavorites);

export default router;
