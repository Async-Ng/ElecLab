import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User as UserModel } from "@/models/User";
import bcrypt from "bcryptjs";

/**
 * PUT /api/user/profile
 * Update user profile information
 */
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized - No user ID provided" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { name, email, position, avatar, currentPassword, newPassword } =
      body;

    // Find user
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update basic info
    if (name) user.name = name;
    if (email) user.email = email;
    if (position !== undefined) user.position = position;
    if (avatar) user.avatar = avatar;

    // Handle password change
    if (currentPassword && newPassword) {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Mật khẩu hiện tại không đúng" },
          { status: 400 }
        );
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    await user.save();

    // Return updated user (exclude password)
    const updatedUser = {
      _id: user._id,
      staff_id: user.staff_id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      rooms_manage: user.rooms_manage,
      avatar: user.avatar,
      position: user.position,
    };

    // Update localStorage on client side
    return NextResponse.json({
      message: "Cập nhật thông tin thành công",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/profile
 * Get current user profile
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized - No user ID provided" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
