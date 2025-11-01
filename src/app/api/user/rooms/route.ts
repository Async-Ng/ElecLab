import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RoomModel } from "@/models/Room";
import { requireAuth, getAuthContext } from "@/lib/apiMiddleware";

/**
 * GET /api/user/rooms
 * Lấy tất cả rooms (read-only cho user)
 * User cần xem tất cả phòng để biết lịch dạy của mình ở phòng nào
 */
export async function GET(request: Request) {
  // Check user authentication
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const auth = getAuthContext(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // User có thể xem tất cả rooms (read-only) để biết phòng học trong TKB
    const rooms = await RoomModel.find({})
      .populate("users_manage", "name email staff_id")
      .lean()
      .exec();

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("GET /api/user/rooms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
