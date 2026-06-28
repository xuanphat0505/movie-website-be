import ReportModel from "../app/Models/ReportModel.js";

// Tạo mới một báo cáo lỗi phim từ người dùng
export const createReport = async (reportData) => {
  const { userId, movieId, movieName, episodeName, type, note } = reportData;

  if (!movieId || !movieName || !type) {
    throw new Error("Thiếu thông tin bắt buộc: movieId, movieName, type");
  }

  const report = await ReportModel.create({
    userId: userId || null,
    movieId,
    movieName,
    episodeName: episodeName || "",
    type,
    note: note || "",
  });

  return report;
};

// Lấy danh sách tất cả báo cáo, sắp xếp mới nhất trước
export const getAllReports = async () => {
  return await ReportModel.find()
    .populate("userId", "username email avatar")
    .sort({ createdAt: -1 });
};

// Cập nhật trạng thái xử lý của một báo cáo
export const updateReportStatus = async (reportId, status) => {
  const validStatuses = ["pending", "resolving", "resolved", "dismissed"];
  if (!validStatuses.includes(status)) {
    throw new Error("Trạng thái không hợp lệ");
  }

  const report = await ReportModel.findByIdAndUpdate(
    reportId,
    { status },
    { new: true }
  );

  if (!report) {
    throw new Error("Không tìm thấy báo cáo");
  }

  return report;
};
