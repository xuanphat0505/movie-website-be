import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  googleLogin,
} from "../app/Controllers/AuthController.js";

import { verifyToken } from "../middlewares/verify.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/refresh-token", refreshToken);
router.post("/logout", verifyToken, logout);

export default router;
