import * as XLSX from "xlsx";
import { Timetable } from "./types";

export function importTimetableFromFile(file: File): Promise<Timetable[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets["TKB"];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const timetableData: Timetable[] = rows.map((row, i) => ({
          index: row["STT"] ? Number(row["STT"]) : i + 1,
          year: row["Năm học"] || "",
          semester: row["Học kỳ"] || "",
          date: row["Ngày"] || "",
          session: row["Từ"] || "",
          time: row["Giờ học"] || "",
          subject: row["Môn học"] || "",
          room: row["Phòng học"] || "",
          className: row["Lớp"] || "",
          teacher: row["Giảng viên"] || "",
          period: row["Buổi"] || "",
          status: "Bình thường",
          note: "",
          attachment: "",
        }));

        resolve(timetableData);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
