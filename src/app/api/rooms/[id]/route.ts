import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RoomModel } from "@/models/Room";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const room = await RoomModel.findOne({ _id: params.id });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ room }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectToDatabase();

    // Lấy phòng cũ để so sánh users_manage
    const oldRoom = await RoomModel.findOne({ _id: params.id });
    if (!oldRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const updatedRoom = await RoomModel.findOneAndUpdate(
      { _id: params.id },
      { $set: body },
      { new: true }
    );

    // Đồng bộ rooms_manage cho user
    const mongoose = require("mongoose");
    const UserModel = mongoose.models.User || mongoose.model("User");
    const roomId = params.id;
    const oldUserIds: string[] = (oldRoom.users_manage || []).map((u: any) =>
      u.toString()
    );
    const newUserIds: string[] = (body.users_manage || []).map((u: any) =>
      u.toString()
    );

    // User bị loại khỏi phòng
    const removedUserIds: string[] = oldUserIds.filter(
      (id: string) => !newUserIds.includes(id)
    );
    // User mới được thêm vào phòng
    const addedUserIds: string[] = newUserIds.filter(
      (id: string) => !oldUserIds.includes(id)
    );

    // Xóa phòng khỏi rooms_manage của user bị loại
    await Promise.all(
      removedUserIds.map((userId: string) =>
        UserModel.findByIdAndUpdate(userId, { $pull: { rooms_manage: roomId } })
      )
    );
    // Thêm phòng vào rooms_manage của user mới
    await Promise.all(
      addedUserIds.map((userId: string) =>
        UserModel.findByIdAndUpdate(userId, {
          $addToSet: { rooms_manage: roomId },
        })
      )
    );

    return NextResponse.json({ room: updatedRoom }, { status: 200 });
  } catch (error) {
    console.error("Failed to update room:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const deletedRoom = await RoomModel.findOneAndDelete({ _id: params.id });

    if (!deletedRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Room deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
