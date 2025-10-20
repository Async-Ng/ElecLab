import dayjs from "dayjs";

export interface TimetableItem {
  index: number | string;
  year: string;
  semester: string;
  date: string;      // "08/08/2024"
  from: string;      // "1-2"
  time: string;      // "7:00-11:45"
  subject: string;
  room: string;
  className: string;
  teacher: string;
  session: string;   // "Sáng" hoặc "Chiều"
}

/**
 * Chuyển số ngày Excel (serial number) -> đối tượng dayjs
 */
function excelSerialToDayjs(serial: number) {
  return dayjs("1899-12-30").add(serial, "day");
}

/**
 * Chuẩn hoá dữ liệu từ Excel sang format chuẩn TimetableItem[]
 * dành cho cấu trúc bảng có cột "Buổi"
 */
export function normalizeTimetableData(rawData: any[]): TimetableItem[] {
  if (!Array.isArray(rawData)) return [];

  // Bỏ qua phần header "LỊCH GIẢNG DẠY"
  const rows = rawData.slice(2);

  return rows
    .map((r) => {
      const rawDate = r["__EMPTY_3"];
      let dateStr = "";

      // Nếu là số (kiểu Excel date), convert sang chuỗi
      if (typeof rawDate === "number") {
        dateStr = excelSerialToDayjs(rawDate).format("DD/MM/YYYY");
      } 
      // Nếu là chuỗi, giữ nguyên (ví dụ: "8/8/2024")
      else if (typeof rawDate === "string" && rawDate.trim() !== "") {
        dateStr = rawDate.trim();
      }

      return {
        index: r["__EMPTY"] ?? "",
        year: r["__EMPTY_1"] ?? "",
        semester: r["__EMPTY_2"] ?? "",
        date: dateStr,
        from: r["__EMPTY_4"] ?? "",
        time: r["__EMPTY_5"] ?? "",
        subject: r["__EMPTY_6"] ?? "",
        room: r["__EMPTY_7"] ?? "",
        className: r["__EMPTY_8"] ?? "",
        teacher: r["__EMPTY_9"] ?? "",
        session: r["__EMPTY_10"] ?? "", // buổi học (Sáng/Chiều)
      } as TimetableItem;
    })
    // Lọc bỏ các hàng rỗng hoặc không có môn học
    .filter((it) => it.subject && it.date);
}
