import { NextResponse } from "next/server";
import { readTimetableData } from "@/features/timetable/services/excelReader";

export async function GET() {
  const data = readTimetableData();

  if (!data || data.length === 0) {
    return NextResponse.json({ success: false, message: "Không có dữ liệu" });
  }

  return NextResponse.json({ success: true, data });
}
