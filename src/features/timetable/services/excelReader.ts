// src/features/timetable/utils/excelReader.ts
import * as XLSX from "xlsx";

export const readExcelFile = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const sheet = workbook.Sheets["TKB"];
  if (!sheet) throw new Error("Không tìm thấy sheet 'TKB' trong file Excel!");

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  return rows.map((row: any, index: number) => ({
    id: index + 1,
    year: row["Năm học"] || "",
    semester: row["Học kỳ"] || "",
    date: row["Ngày"] || "",
    session: row["Buổi"] || "",
    time: row["Giờ học"] || "",
    subject: row["Môn học"] || "",
    room: row["Phòng"] || "",
    className: row["Lớp"] || "",
    teacher: row["Giảng viên"] || "",
    period: row["Tiết học"] || "",
  }));
};
