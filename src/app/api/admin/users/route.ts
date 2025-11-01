import { NextResponse } from "next/server";
import { Binary } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireAdmin } from "@/lib/apiMiddleware";
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

    const usersWithAvatar = users.map((u: any) => {
      const avatar = u.avatar;
      if (avatar) {
        if (avatar instanceof Binary) {
          const buffer = avatar.buffer as Buffer;
          u.avatar = buffer.toString("base64");
        } else if (Buffer.isBuffer(avatar)) {
          u.avatar = avatar.toString("base64");
        } else {
          u.avatar = null;
        }
      } else {
        u.avatar = null;
      }
      return u;
    });

    return NextResponse.json(usersWithAvatar);
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
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

    // Process avatar if provided
    if (body.avatar) {
      if (typeof body.avatar === "string") {
        const base64 = body.avatar.includes(",")
          ? body.avatar.split(",")[1]
          : body.avatar;
        body.avatar = Buffer.from(base64, "base64");
      } else if (body.avatar instanceof ArrayBuffer) {
        body.avatar = Buffer.from(body.avatar);
      }
    }

    const user = await User.create(body);
    const userWithoutPassword = { ...user.toObject(), password: undefined };

    if (user.avatar) {
      userWithoutPassword.avatar = `data:image/png;base64,${user.avatar.toString(
        "base64"
      )}`;
    }

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
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

    // If password is being updated, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Process avatar if provided
    if (updateData.avatar) {
      if (typeof updateData.avatar === "string") {
        const base64 = updateData.avatar.includes(",")
          ? updateData.avatar.split(",")[1]
          : updateData.avatar;
        updateData.avatar = Buffer.from(base64, "base64");
      } else if (updateData.avatar instanceof ArrayBuffer) {
        updateData.avatar = Buffer.from(updateData.avatar);
      }
    }

    const updated = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userObj = updated.toObject();
    if (updated.avatar) {
      userObj.avatar = `data:image/png;base64,${updated.avatar.toString(
        "base64"
      )}`;
    }

    return NextResponse.json(userObj);
  } catch (error) {
    console.error("PUT /api/admin/users error:", error);
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
    console.error("DELETE /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
