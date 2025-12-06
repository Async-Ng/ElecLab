import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User as UserModel } from "@/models/User";

/**
 * GET /api/user/me
 * Get current authenticated user information
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

    await connectToDatabase();

    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        staff_id: user.staff_id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        rooms_manage: user.rooms_manage,
        avatar: user.avatar,
        position: user.position,
      },
    });
  } catch (error: any) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
