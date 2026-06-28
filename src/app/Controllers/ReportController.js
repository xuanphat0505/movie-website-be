import * as ReportService from "../../services/ReportService.js";

// Tạo báo cáo lỗi mới từ người dùng thông qua service
export const createReport = async (req, res) => {
  const userId = req.user?._id || null;
  try {
    const report = await ReportService.createReport({
      ...req.body,
      userId,
    });
    return res.status(201).json({
      success: true,
      message: "Báo cáo đã được ghi nhận. Cảm ơn bạn!",
      data: report,
    });
  } catch (error) {
    return res.status(error.message.includes("Thiếu") ? 400 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy danh sách tất cả báo cáo (chỉ dành cho admin)
export const getAllReports = async (req, res) => {
  try {
    const reports = await ReportService.getAllReports();
    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật trạng thái xử lý của báo cáo (chỉ dành cho admin)
export const updateReportStatus = async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;
  try {
    const report = await ReportService.updateReportStatus(reportId, status);
    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái báo cáo thành công",
      data: report,
    });
  } catch (error) {
    const status = error.message.includes("không hợp lệ") ? 400 : error.message.includes("không tìm thấy") ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};
