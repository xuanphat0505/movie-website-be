import express from "express";
import {
  getActiveUsers,
  getMaleUsers,
  getFemaleUsers,
  getTotalUsers,
  getDashboardOverviewStats,
  getGenderStats,
} from "../app/Controllers/AnalyticsController.js";

const router = express.Router();

router.get("/active-users", getActiveUsers);
router.get("/male-users", getMaleUsers);
router.get("/female-users", getFemaleUsers);
router.get("/total-users", getTotalUsers);
router.get("/overview-stats", getDashboardOverviewStats);
router.get("/gender-stats", getGenderStats);

export default router;
