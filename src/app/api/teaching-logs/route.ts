export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  try {
    const created = await TeachingLog.create(body);
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create log" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import TeachingLog from "@/models/TeachingLog";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const userRole = searchParams.get("userRole");

  try {
    let query: any = {};
    if (userRole === "Head_of_deparment") {
      query = {};
    } else if (userId) {
      // Giảng viên chỉ xem log liên quan đến các timetable mà họ là lecturer
      // We'll fetch logs and populate timetable; filter by timetable.lecturer after populate is acceptable here.
      query = {};
    }

    const logs = await TeachingLog.find(query)
      .populate({
        path: "timetable",
        populate: [
          { path: "lecturer", select: "name" },
          { path: "room", select: "name" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    let result = logs;
    if (userRole !== "Head_of_deparment" && userId) {
      result = (logs as any[]).filter((log) => {
        const tt = log.timetable;
        if (!tt) return false;
        if (typeof tt.lecturer === "string") return tt.lecturer === userId;
        return (
          tt.lecturer?._id?.toString() === userId || tt.lecturer === userId
        );
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET TEACHING LOGS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch teaching logs" },
      { status: 500 }
    );
  }
}
