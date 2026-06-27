import * as AnalyticsService from "../../services/AnalyticsService.js";

// Lấy số lượng người dùng đang hoạt động từ service và phản hồi kết quả
export const getActiveUsers = async (req, res) => {
  try {
    const count = await AnalyticsService.getActiveUsersCount();
    res.status(200).json({ data: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy số lượng người dùng giới tính nam từ service
export const getMaleUsers = async (req, res) => {
  try {
    const count = await AnalyticsService.getMaleUsersCount();
    res.status(200).json({ data: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy số lượng người dùng giới tính nữ từ service
export const getFemaleUsers = async (req, res) => {
  try {
    const count = await AnalyticsService.getFemaleUsersCount();
    res.status(200).json({ data: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tổng số lượng tất cả người dùng từ service
export const getTotalUsers = async (req, res) => {
  try {
    const count = await AnalyticsService.getTotalUsersCount();
    res.status(200).json({ data: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin thống kê tổng quan của trang quản trị từ service
export const getDashboardOverviewStats = async (req, res) => {
  try {
    const stats = await AnalyticsService.getOverviewStatsData();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy thống kê phân chia tỷ lệ giới tính người dùng từ service
export const getGenderStats = async (req, res) => {
  try {
    const stats = await AnalyticsService.getGenderStatsData();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
