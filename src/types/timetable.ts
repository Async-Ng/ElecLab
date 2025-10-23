// types/timetable.types.ts
export interface Session {
  sessionNumber: number;
  startTime: string;
  endTime: string;
}

export const SESSIONS: Session[] = [
  { sessionNumber: 1, startTime: '07:00', endTime: '09:30' },
  { sessionNumber: 2, startTime: '09:45', endTime: '11:45' },
  { sessionNumber: 3, startTime: '12:30', endTime: '14:45' },
  { sessionNumber: 4, startTime: '15:00', endTime: '17:15' },
  
];

export type NoteStatus = 'normal' | 'incident';
export type ViewMode = 'week' | 'month';
export type Semester = '1' | '2' | '3';

export interface TimetableEntry {
  _id?: string;
  academicYear: string;
  semester: Semester;
  date: Date;
  sessions: number[];
  subject: string;
  room: string;
  class: string;
  instructor: string;
  noteStatus: NoteStatus;
  incidentNote?: string;
  incidentImages?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TimetableFormData extends Omit<TimetableEntry, '_id' | 'createdAt' | 'updatedAt'> {}