import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireAdmin } from "@/lib/apiMiddleware";
import { uploadImageToImgBB } from "@/lib/imgbb";
import bcrypt from "bcryptjs";

/**
 * GET /api/admin/users
 * Lấy tất cả users (chỉ admin)
 */
export async function GET(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    await connectToDatabase();

    const users = await User.find({}).select("-password").lean().exec();

    // Avatar is now stored as URL string from ImgBB, no conversion needed
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Tạo user mới (chỉ admin)
 */
export async function POST(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    await connectToDatabase();

    // Check if staff_id or email already exists
    const existingUser = await User.findOne({
      $or: [{ staff_id: body.staff_id }, { email: body.email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Staff ID or email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    body.password = await bcrypt.hash(body.password, salt);

    // Upload avatar to ImgBB if provided
    if (body.avatar && typeof body.avatar === "string") {
      const avatarUrl = await uploadImageToImgBB(
        body.avatar,
        `avatar_${Date.now()}`
      );
      if (avatarUrl) {
        body.avatar = avatarUrl;
      } else {
        body.avatar = null;
      }
    }

    const user = await User.create(body);
    const userWithoutPassword = { ...user.toObject(), password: undefined };

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users
 * Cập nhật user (chỉ admin)
 */
export async function PUT(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // If password is being updated, hash it; otherwise remove it from updateData
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      // Don't update password if it's empty/null
      delete updateData.password;
    }

    // Upload avatar to ImgBB if provided
    if (updateData.avatar && typeof updateData.avatar === "string") {
      const avatarUrl = await uploadImageToImgBB(
        updateData.avatar,
        `avatar_${Date.now()}`
      );
      if (avatarUrl) {
        updateData.avatar = avatarUrl;
      } else {
        delete updateData.avatar;
      }
    }

    const updated = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updated.toObject());
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users
 * Xóa user (chỉ admin)
 */
export async function DELETE(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
