const RankType = require("../../models/RankTypeModel");
const Type = require("../models/TypeModel");

export const getRankedTypes = async (req, res) => {
  try {
    const { date, limit = 10 } = req.query;
    const queryDate = date ? new Date(date) : new Date();

    // Set time to start of day
    queryDate.setHours(0, 0, 0, 0);

    const rankedTypes = await RankType.find({
      rankDate: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .sort({ totalScore: -1 })
      .limit(parseInt(limit))
      .populate("typeId", "name slug");

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

export const updateTypeRanking = async (req, res) => {
  try {
    const { typeId, views, likes, comments } = req.body;

    // Find or create rank entry for today
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

    // Update metrics
    if (views) rankEntry.views = views;
    if (likes) rankEntry.likes = likes;
    if (comments) rankEntry.comments = comments;

    // Calculate new total score
    rankEntry.calculateTotalScore();
    await rankEntry.save();

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

export const getTypeRankingHistory = async (req, res) => {
  try {
    const { typeId, startDate, endDate } = req.query;

    const query = { typeId };
    if (startDate && endDate) {
      query.rankDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const history = await RankType.find(query)
      .sort({ rankDate: -1 })
      .populate("typeId", "name slug");

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

