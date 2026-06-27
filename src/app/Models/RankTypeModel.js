
import mongoose from "mongoose";

const rankTypeSchema = new mongoose.Schema(
  {
    typeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    rankDate: {
      type: Date,
      default: Date.now,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Tính điểm tổng hợp dựa trên views, likes và comments
rankTypeSchema.methods.calculateTotalScore = function () {
  this.totalScore = this.views * 1 + this.likes * 2 + this.comments * 3;
};


const RankType = mongoose.model("RankType", rankTypeSchema);

export default RankType;
