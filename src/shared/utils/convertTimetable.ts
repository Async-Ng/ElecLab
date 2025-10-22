import dayjs from "dayjs";

/**
 * Kiểu dữ liệu cho một dòng thời khoá biểu sau khi chuẩn hoá
 */
export interface TimetableItem {
  year: string;
  semester: string;
  date: string;
  time: string;
  subject: string;
  room: string;
  className: string;
  teacher: string;
}

/**
 * Chuyển số serial Excel thành đối tượng dayjs
 * (Excel tính từ ngày 1900-01-01 là 1)
 */
function excelSerialToDate(serial: number): dayjs.Dayjs {
  const excelEpoch = dayjs("1899-12-30");
  return excelEpoch.add(serial, "day");
}

/**
 * Chuẩn hoá dữ liệu từ Excel JSON export
 */
export function normalizeTimetableData(rawData: any[]): TimetableItem[] {
  return rawData
    .slice(2) // bỏ 2 dòng đầu (tiêu đề, header)
    .map((row) => {
      const dateValue = row["__EMPTY_3"];
      let dateStr = "";

      if (typeof dateValue === "number") {
        // nếu là số -> chuyển từ Excel serial date
        dateStr = excelSerialToDate(dateValue).format("DD/MM/YYYY");
      } else if (typeof dateValue === "string") {
        dateStr = dateValue;
      }

      return {
        year: row["__EMPTY_1"] ?? "",
        semester: row["__EMPTY_2"] ?? "",
        date: dateStr,
        time: row["__EMPTY_6"] ?? "",
        subject: row["__EMPTY_7"] ?? "",
        room: row["__EMPTY_8"] ?? "",
        className: row["__EMPTY_9"] ?? "",
        teacher: row["__EMPTY_10"] ?? "",
      } as TimetableItem;
    })
    .filter((row) => row.subject && row.date);
}
