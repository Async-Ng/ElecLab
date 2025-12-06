import mongoose from "mongoose";
import { Semester, Period, StudyTime } from "../types/timetable";

const TimetableSchema = new mongoose.Schema({
  schoolYear: { type: String, required: true },
  semester: {
    type: Number,
    required: true,
    enum: Object.values(Semester).filter((v) => typeof v === "number"),
  },
  date: { type: String, required: true },
  week: {
    type: Number,
    required: true,
    min: 1,
    max: 52,
  },
  period: {
    type: Number,
    required: true,
    enum: Object.values(Period).filter((v) => typeof v === "number"),
  },
  time: {
    type: String,
    required: true,
    enum: Object.values(StudyTime).filter((v) => typeof v === "string"),
  },
  subject: { type: String, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  className: { type: String, required: true },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  note: { type: String, default: "" }, // Ghi chú cho TKB
});

// Tối ưu: Thêm indexes cho các trường thường query và sort
TimetableSchema.index({ lecturer: 1 });
TimetableSchema.index({ room: 1 });
TimetableSchema.index({ date: -1, period: 1 }); // Compound index cho sorting
TimetableSchema.index({ schoolYear: 1, semester: 1 });

export default mongoose.models.Timetable ||
  mongoose.model("Timetable", TimetableSchema);
