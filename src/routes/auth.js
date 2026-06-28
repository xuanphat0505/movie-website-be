import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  googleLogin,
  adminLogin,
  adminGoogleLogin,
  mfaSetup,
  mfaVerify,
  mfaDisable,
  adminMfaLogin,
} from "../app/Controllers/AuthController.js";

import { verifyToken } from "../middlewares/verify.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.post("/admin/google-login", adminGoogleLogin);
router.post("/google-login", googleLogin);
router.post("/refresh-token", refreshToken);
router.post("/logout", verifyToken, logout);

// API cho xác thực hai lớp (2FA)
router.get("/mfa/setup", verifyToken, mfaSetup);
router.post("/mfa/verify", verifyToken, mfaVerify);
router.post("/mfa/disable", verifyToken, mfaDisable);
router.post("/admin/mfa-login", adminMfaLogin);

export default router;
