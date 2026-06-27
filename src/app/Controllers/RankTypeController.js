import * as RankTypeService from "../../services/RankTypeService.js";

// Lấy danh sách phân loại được xếp hạng thông
export const getRankedTypes = async (req, res) => {
  try {
    const { date, limit } = req.query;
    const rankedTypes = await RankTypeService.getRankedTypes(date, limit);

    res.json({
      success: true,
      data: rankedTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật chỉ số xếp hạng của phân loại
export const updateTypeRanking = async (req, res) => {
  try {
    const { typeId, views, likes, comments } = req.body;
    const rankEntry = await RankTypeService.updateTypeRanking(typeId, { views, likes, comments });

    res.json({
      success: true,
      data: rankEntry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy lịch sử xếp hạng của phân loại
export const getTypeRankingHistory = async (req, res) => {
  try {
    const { typeId, startDate, endDate } = req.query;
    const history = await RankTypeService.getTypeRankingHistory(typeId, startDate, endDate);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

