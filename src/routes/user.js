import { Router } from "express";
import {
  forgetPassword,
  changePassword,
  verifyResetPaswordToken,
  getUser,
  updateUser,
} from "../app/Controllers/UserController.js";

import { verifyToken } from "../middlewares/verify.js";

const router = Router();

router.get("/", verifyToken, getUser);
router.put("/update", verifyToken, updateUser);
router.post("/forget-password", forgetPassword);
router.post("/change-password", changePassword);
router.post("/verify-token", verifyResetPaswordToken);

export default router;
