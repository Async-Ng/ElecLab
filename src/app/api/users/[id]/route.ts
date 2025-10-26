import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  try {
    await connectToDatabase();
    const user = await User.findById(id).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { message: "Lỗi khi lấy thông tin người dùng" },
      { status: 500 }
    );
  }
}
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  try {
    const body = await request.json();
    await connectToDatabase();

    // Check if updated staff_id or email conflicts with other users
    const existingUser = await User.findOne({
      _id: { $ne: id },
      $or: [{ staff_id: body.staff_id }, { email: body.email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Mã nhân viên hoặc email đã tồn tại" },
        { status: 400 }
      );
    }

    // Remove password field if it's empty
    if (!body.password) {
      delete body.password;
    }

    // Lấy user cũ để so sánh rooms_manage
    const oldUser = await User.findById(id);
    if (!oldUser) {
      return NextResponse.json(
        { message: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).select("-password");

    // Đồng bộ users_manage cho phòng
    const mongoose = require("mongoose");
    const RoomModel = mongoose.models.Room || mongoose.model("Room");
    const userId = id;
    const oldRoomIds: string[] = (oldUser.rooms_manage || []).map((r: any) =>
      r.toString()
    );
    const newRoomIds: string[] = (body.rooms_manage || []).map((r: any) =>
      r.toString()
    );

    // Phòng bị loại khỏi user
    const removedRoomIds: string[] = oldRoomIds.filter(
      (id: string) => !newRoomIds.includes(id)
    );
    // Phòng mới được thêm vào user
    const addedRoomIds: string[] = newRoomIds.filter(
      (id: string) => !oldRoomIds.includes(id)
    );

    // Xóa user khỏi users_manage của phòng bị loại
    await Promise.all(
      removedRoomIds.map((roomId: string) =>
        RoomModel.findByIdAndUpdate(roomId, { $pull: { users_manage: userId } })
      )
    );
    // Thêm user vào users_manage của phòng mới
    await Promise.all(
      addedRoomIds.map((roomId: string) =>
        RoomModel.findByIdAndUpdate(roomId, {
          $addToSet: { users_manage: userId },
        })
      )
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { message: "Lỗi khi cập nhật người dùng" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  try {
    await connectToDatabase();
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { message: "Lỗi khi xóa người dùng" },
      { status: 500 }
    );
  }
}
