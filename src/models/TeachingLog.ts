import mongoose, { Schema, Types } from "mongoose";
import { TeachingLogStatus } from "../types/teachingLog";

const TeachingLogSchema: Schema = new Schema(
  {
    timetable: {
      type: Schema.Types.ObjectId,
      ref: "Timetable",
      required: true,
    },
    note: { type: String },
    images: [{ type: Buffer }],
    status: {
      type: String,
      enum: Object.values(TeachingLogStatus),
      default: TeachingLogStatus.NORMAL,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Tối ưu: Thêm indexes cho các trường thường query
TeachingLogSchema.index({ timetable: 1 });
TeachingLogSchema.index({ createdAt: -1 }); // Index cho sorting
TeachingLogSchema.index({ status: 1 });

export default mongoose.models.TeachingLog ||
  mongoose.model("TeachingLog", TeachingLogSchema);
