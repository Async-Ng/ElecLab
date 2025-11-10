import { Room } from "./room";
import { User } from "./user";
// Học kỳ
export enum Semester {
  First = 1,
  Second = 2,
  Third = 3,
}

// Ca học
export enum Period {
  Period1 = 1,
  Period2 = 2,
  Period3 = 3,
  Period4 = 4,
}

// Thời gian học
export enum StudyTime {
  Period1 = "07:00-09:15",
  Period2 = "09:30-11:45",
  Period3 = "12:30-14:45",
  Period4 = "15:00-17:15",
}
// ...existing code...
export interface Timetable {
  _id?: string; // ID của lịch dạy
  schoolYear: string; // Năm học, ví dụ: "2025-2026"
  semester: Semester; // Học kỳ
  date: string; // Ngày, định dạng vi-VN: "DD/MM/YYYY" hoặc "DD-MM-YYYY"
  week: number; // Số tuần (1-52: HK1=1-20, HK2=21-40, HK3=41-52)
  period: Period; // Ca học
  time: StudyTime; // Giờ học
  subject: string; // Môn học
  room: string | Room; // Tham chiếu đến roomId hoặc Room
  className: string; // Lớp
  lecturer: string | User; // Tham chiếu đến userId hoặc User
  note?: string; // Ghi chú cho TKB
}
