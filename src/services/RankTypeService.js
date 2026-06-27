import RankType from "../app/Models/RankTypeModel.js";

// Lấy danh sách xếp hạng của ngày cụ thể
export const getRankedTypes = async (date, limit = 10) => {
  const queryDate = date ? new Date(date) : new Date();
  queryDate.setHours(0, 0, 0, 0);

  return await RankType.find({
    rankDate: {
      $gte: queryDate,
      $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
    },
  })
    .sort({ totalScore: -1 })
    .limit(parseInt(limit))
    .populate("typeId", "name slug");
};

// Cập nhật các chỉ số xếp hạng của Type
export const updateTypeRanking = async (typeId, metrics) => {
  const { views, likes, comments } = metrics;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let rankEntry = await RankType.findOne({
    typeId,
    rankDate: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (!rankEntry) {
    rankEntry = new RankType({
      typeId,
      views: 0,
      likes: 0,
      comments: 0,
      rankDate: today,
    });
  }

  if (views !== undefined) rankEntry.views = views;
  if (likes !== undefined) rankEntry.likes = likes;
  if (comments !== undefined) rankEntry.comments = comments;

  rankEntry.calculateTotalScore();
  await rankEntry.save();
  return rankEntry;
};

// Lấy lịch sử xếp hạng của Type trong khoảng thời gian xác định
export const getTypeRankingHistory = async (typeId, startDate, endDate) => {
  const query = { typeId };
  if (startDate && endDate) {
    query.rankDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  return await RankType.find(query)
    .sort({ rankDate: -1 })
    .populate("typeId", "name slug");
};
