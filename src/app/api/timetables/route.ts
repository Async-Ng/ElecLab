import { NextResponse } from "next/server";
import Timetable from "@/models/Timetable";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const userRole = searchParams.get("userRole");
  let query = {};
  if (userRole === "Head_of_deparment") {
    // Trưởng khoa xem toàn bộ
    query = {};
  } else if (userId) {
    // Giảng viên chỉ xem thời khóa biểu của mình
    query = { lecturer: userId };
  }
  const timetables = await Timetable.find(query);
  return NextResponse.json(timetables);
}

export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  const timetable = await Timetable.create(body);
  return NextResponse.json(timetable);
}
