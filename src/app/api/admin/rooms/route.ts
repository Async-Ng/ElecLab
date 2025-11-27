import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RoomModel } from "@/models/Room";
import { User } from "@/models/User";
import { requireAdmin } from "@/lib/apiMiddleware";
import mongoose from "mongoose";

/**
 * GET /api/admin/rooms
 * Lấy tất cả rooms (chỉ admin)
 */
export async function GET(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    await connectToDatabase();

    const rooms = await RoomModel.find()
      .populate("users_manage", "name email staff_id")
      .lean()
      .exec();

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("GET /api/admin/rooms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/rooms
 * Tạo room mới (chỉ admin)
 */
export async function POST(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    await connectToDatabase();

    const newRoom = new RoomModel({
      ...body,
      users_manage: body.users_manage || [],
    });

    await newRoom.save();

    // Đồng bộ rooms_manage cho user quản lý phòng
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
    console.error("POST /api/admin/rooms error:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/rooms
 * Cập nhật room (chỉ admin)
 */
export async function PUT(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updated = await RoomModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Nếu users_manage có thay đổi, đồng bộ lại
    if (updateData.users_manage) {
      const UserModel = mongoose.models.User || mongoose.model("User");
      const roomId = updated._id.toString();
      const userIds: string[] = updateData.users_manage.map((u: any) =>
        u.toString()
      );

      // Xóa room khỏi tất cả users cũ
      await UserModel.updateMany(
        { rooms_manage: roomId },
        { $pull: { rooms_manage: roomId } }
      );

      // Thêm room vào users mới
      await Promise.all(
        userIds.map((userId: string) =>
          UserModel.findByIdAndUpdate(userId, {
            $addToSet: { rooms_manage: roomId },
          })
        )
      );
    }

    return NextResponse.json({ room: updated });
  } catch (error) {
    console.error("PUT /api/admin/rooms error:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/rooms
 * Xóa room (chỉ admin)
 */
export async function DELETE(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deleted = await RoomModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Xóa room khỏi users_manage của tất cả users
    const UserModel = mongoose.models.User || mongoose.model("User");
    await UserModel.updateMany(
      { rooms_manage: id },
      { $pull: { rooms_manage: id } }
    );

    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/rooms error:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
