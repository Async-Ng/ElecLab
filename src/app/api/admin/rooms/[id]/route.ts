import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RoomModel } from "@/models/Room";
import { User } from "@/models/User";
import { requireAdmin } from "@/lib/apiMiddleware";
import mongoose from "mongoose";

/**
 * PUT /api/admin/rooms/[id]
 * Cập nhật room theo ID (chỉ admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const updateData = await request.json();
    await connectToDatabase();

    const updated = await RoomModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("users_manage", "name email staff_id");

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
    console.error("PUT /api/admin/rooms/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/rooms/[id]
 * Xóa room theo ID (chỉ admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
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
    console.error("DELETE /api/admin/rooms/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
