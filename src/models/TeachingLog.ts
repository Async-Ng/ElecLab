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

export default mongoose.models.TeachingLog ||
  mongoose.model("TeachingLog", TeachingLogSchema);
