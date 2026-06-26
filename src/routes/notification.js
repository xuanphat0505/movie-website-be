import express from "express";
import {
  getNotifications,
  updateNotificationSettings,
  readOneNotification,
  readAllNotifications,
} from "../app/Controllers/NotificationController.js";
import { verifyToken } from "../middlewares/verify.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.post("/update", verifyToken, updateNotificationSettings);
router.post("/read-one/:notificationId", verifyToken, readOneNotification);
router.post("/read-all", verifyToken, readAllNotifications);

export default router;
