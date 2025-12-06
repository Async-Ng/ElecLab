import { Timetable } from "./timetable";
export enum TeachingLogStatus {
  NORMAL = "Bình thường",
  INCIDENT = "Sự cố",
}

export interface TeachingLog {
  _id: string;
  timetable: Timetable | string; // Tham chiếu đến Timetable hoặc ObjectId
  note?: string;
  images?: string[]; // Array of image URLs (ImgBB URLs)
  status: TeachingLogStatus;
  createdAt: string;
  updatedAt: string;
}
