export interface TimetableItem {
  STT: number;
  "Năm học": string;
  "Học kỳ": string;
  "Ngày": string;
  "Tiết": string;
  "Giờ học": string;
  "Môn học": string;
  "Phòng học": string;
  "Lớp": string;
  "Giảng viên": string;
}

export const studyShifts = [
  { ca: "Ca 1", time: "07:00 - 11:45" },
  { ca: "Ca 2", time: "12:30 - 17:15" },
  { ca: "Ca 3", time: "17:30 - 21:30" },
];
