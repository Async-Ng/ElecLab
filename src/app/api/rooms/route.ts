import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RoomModel } from "@/models/Room";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const userRole = searchParams.get("userRole");

    await connectToDatabase();

    let query = {};
    if (userRole === "Admin") {
      // Quản lý xem tất cả phòng
      query = {};
    } else if (userId) {
      // Người dùng chỉ xem phòng mình quản lý
      query = { users_manage: userId };
    }
    
    // Tối ưu: Sử dụng lean() và chỉ populate fields cần thiết
    const rooms = await RoomModel.find(query)
      .populate("users_manage", "name email staff_id") // Chỉ lấy fields cần thiết
      .lean()
      .exec();
      
    return NextResponse.json({ rooms }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const userRole = searchParams.get("userRole");

    if (userRole !== "Admin") {
      return NextResponse.json(
        { error: "Unauthorized: Only Admin can create rooms" },
        { status: 403 }
      );
    }

    const body = await request.json();
    await connectToDatabase();

    const newRoom = new RoomModel({
      ...body,
      users_manage: body.users_manage || [], // Ensure users_manage is initialized
    });

    await newRoom.save();

    // Đồng bộ rooms_manage cho user quản lý phòng
    const mongoose = require("mongoose");
    const UserModel = mongoose.models.User || mongoose.model("User");
    const roomId = newRoom._id.toString();
    const userIds: string[] = (newRoom.users_manage || []).map((u: any) =>
      u.toString()
    );
    await Promise.all(
      userIds.map((userId: string) =>
        UserModel.findByIdAndUpdate(userId, {
          $addToSet: { rooms_manage: roomId },
        })
      )
    );
    return NextResponse.json({ room: newRoom }, { status: 201 });
  } catch (error) {
    console.error("Failed to create room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
