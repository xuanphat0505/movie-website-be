import express from "express";
import {
  getActiveUsers,
  getMaleUsers,
  getFemaleUsers,
  getTotalUsers,
} from "../app/Controllers/AnalyticsController.js";

const router = express.Router();

router.get("/active-users", getActiveUsers);
router.get("/male-users", getMaleUsers);
router.get("/female-users", getFemaleUsers);
router.get("/total-users", getTotalUsers);

export default router;
