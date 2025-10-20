export interface Timetable {
  id?: string; // id từ MockAPI
  index: number;
  year: string;
  semester: string;
  date: string;
  session: string;
  time: string;
  subject: string;
  room: string;
  className: string;
  teacher: string;
  period: string;
  status?: "Bình thường" | "Có sự cố";
  note?: string;
  attachment?: string; // URL ảnh minh chứng
}
