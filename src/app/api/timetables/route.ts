import { NextResponse } from "next/server";
import Timetable from "@/models/Timetable";
import { connectToDatabase } from "@/lib/mongodb";

export async function PATCH(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  const { _id, ...updateData } = body;
  if (!_id) {
    return NextResponse.json(
      { error: "Missing _id for update" },
      { status: 400 }
    );
  }
  try {
    const updated = await Timetable.findByIdAndUpdate(_id, updateData, {
      new: true,
    });
    if (!updated) {
      return NextResponse.json(
        { error: "Timetable not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch (error) {
    let errorMsg = "Unknown error";
    if (error instanceof Error) {
      errorMsg = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error
    ) {
      errorMsg = (error as any).message;
    }
    console.error("UPDATE TIMETABLE ERROR:", error);
    return NextResponse.json(
      { error: errorMsg, details: error },
      { status: 400 }
    );
  }
}


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
  const timetables = await Timetable.find(query)
    .populate("room", "name room_id")
    .populate("lecturer", "name email");
  return NextResponse.json(timetables);
}

export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  try {
    let result;
    if (Array.isArray(body)) {
      result = await Timetable.insertMany(body);
    } else {
      result = await Timetable.create(body);
    }
    return NextResponse.json(result);
  } catch (error) {
    let errorMsg = "Unknown error";
    if (error instanceof Error) {
      errorMsg = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error
    ) {
      errorMsg = (error as any).message;
    }
    console.error("IMPORT TIMETABLE ERROR:", error);
    return NextResponse.json(
      { error: errorMsg, details: error },
      { status: 400 }
    );
  }
}
