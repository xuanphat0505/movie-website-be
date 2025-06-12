import express from "express";
import {
  updateNotificationSettings,
  readOneNotification,
  readAllNotifications,
} from "../app/Controllers/NotifcationController.js";
import { verifyToken } from "../middlewares/verify.js";

const router = express.Router();

router.post("/update", verifyToken, updateNotificationSettings);
router.post("/read-one/:notificationId", verifyToken, readOneNotification);
router.post("/read-all", verifyToken, readAllNotifications);

export default router;
