import { RoomModel } from "@/models/Room";
import { NextResponse } from "next/server";
import Timetable from "@/models/Timetable";
import { connectToDatabase } from "@/lib/mongodb";

export async function PATCH(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  const { _id, userId, userRole, ...updateData } = body;
  if (!_id) {
    return NextResponse.json(
      { error: "Missing _id for update" },
      { status: 400 }
    );
  }
  // Lấy thông tin TKB hiện tại
  const timetable = await Timetable.findById(_id);
  if (!timetable) {
    return NextResponse.json({ error: "Timetable not found" }, { status: 404 });
  }
  // Ưu tiên quyền Admin nếu có nhiều roles
  // Nếu userRole là mảng, kiểm tra có "Admin" không
  const ADMIN_ROLES = ["Admin", "Quản lý"];
  const isAdmin = Array.isArray(userRole)
    ? userRole.some((r) => ADMIN_ROLES.includes(r))
    : ADMIN_ROLES.includes(userRole);
  if (!isAdmin && timetable.lecturer?.toString() !== userId) {
    return NextResponse.json(
      { error: "Bạn không có quyền chỉnh sửa TKB này" },
      { status: 403 }
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
  if (userRole === "Admin") {
    // Quản lý xem toàn bộ
    query = {};
  } else if (userId) {
    // Người dùng chỉ xem thời khóa biểu của mình
    query = { lecturer: userId };
  }

  // Tối ưu: Sử dụng lean() và chỉ populate fields cần thiết
  const timetables = await Timetable.find(query)
    .populate("room", "name room_id")
    .populate("lecturer", "name email staff_id")
    .lean()
    .sort({ date: -1, period: 1 }) // Sắp xếp ngay trong query
    .exec();

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
