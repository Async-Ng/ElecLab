// models/timetable.model.ts
import mongoose, { Schema, Model } from 'mongoose';
import { TimetableEntry } from '@/types/timetable';

const TimetableSchema = new Schema<TimetableEntry>(
  {
    academicYear: { type: String, required: true },
    semester: { type: String, enum: ['1', '2', '3'], required: true },
    date: { type: Date, required: true },
    sessions: { type: [Number], required: true },
    subject: { type: String, required: true },
    room: { type: String, required: true },
    class: { type: String, required: true },
    instructor: { type: String, required: true },
    noteStatus: { type: String, enum: ['normal', 'incident'], default: 'normal' },
    incidentNote: { type: String },
    incidentImages: { type: [String] }
  },
  {
    timestamps: true,
    collection: 'timetables'
  }
);

// Index for efficient queries
TimetableSchema.index({ date: 1, sessions: 1 });
TimetableSchema.index({ academicYear: 1, semester: 1 });

const Timetable: Model<TimetableEntry> = 
  mongoose.models.Timetable || mongoose.model<TimetableEntry>('Timetable', TimetableSchema);

export default Timetable;