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
});

export default mongoose.models.Timetable ||
  mongoose.model("Timetable", TimetableSchema);
