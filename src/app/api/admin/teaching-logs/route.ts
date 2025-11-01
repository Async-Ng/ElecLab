import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import TeachingLog from "@/models/TeachingLog";
import { requireAdmin } from "@/lib/apiMiddleware";

/**
 * GET /api/admin/teaching-logs
 * Lấy tất cả teaching logs (chỉ admin)
 */
export async function GET(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    await connectToDatabase();

    let query: any = {};
    if (lessonId) {
      query.timetable = lessonId;
    }

    const logs = await TeachingLog.find(query)
      .populate({
        path: "timetable",
        populate: [
          { path: "lecturer", select: "name email staff_id" },
          { path: "room", select: "name room_id" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET /api/admin/teaching-logs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teaching logs" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/teaching-logs
 * Xóa teaching log (chỉ admin)
 */
export async function DELETE(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Teaching log ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deleted = await TeachingLog.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Teaching log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Teaching log deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/admin/teaching-logs error:", error);
    return NextResponse.json(
      { error: "Failed to delete teaching log" },
      { status: 500 }
    );
  }
}
