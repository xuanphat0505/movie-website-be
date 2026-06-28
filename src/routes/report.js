import express from "express";
import {
  createReport,
  getAllReports,
  updateReportStatus,
} from "../app/Controllers/ReportController.js";
import { verifyToken, verifyAdmin } from "../middlewares/verify.js";

const router = express.Router();

router.post("/", verifyToken, createReport);
router.get("/", verifyAdmin, getAllReports);
router.patch("/:reportId/status", verifyAdmin, updateReportStatus);

export default router;
