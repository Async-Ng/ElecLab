export enum TeachingLogStatus {
  NORMAL = "Bình thường",
  INCIDENT = "Sự cố",
}

export interface TeachingLog {
  _id: string;
  timetable: import("./timetable").Timetable | string; // Tham chiếu đến Timetable hoặc ObjectId
  note?: string;
  imageUrl?: string[];
  status: TeachingLogStatus;
  createdAt: string;
  updatedAt: string;
}
