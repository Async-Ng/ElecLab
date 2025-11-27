import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import TeachingLog from "@/models/TeachingLog";
import Timetable from "@/models/Timetable";
import { User } from "@/models/User";
import { requireAuth, getAuthContext } from "@/lib/apiMiddleware";
import { uploadImagesToImgBB } from "@/lib/imgbb";

/**
 * GET /api/user/teaching-logs
 * Lấy teaching logs của user (chỉ xem logs của timetables mà user là lecturer)
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

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    await connectToDatabase();

    let query: any = {};
    if (lessonId) {
      query.timetable = lessonId;
    }

    // Lấy logs và filter theo lecturer
    const logs = await TeachingLog.find(query)
      .populate({
        path: "timetable",
        match: { lecturer: auth.userId },
        populate: [
          { path: "lecturer", select: "name email staff_id" },
          { path: "room", select: "name room_id" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Filter out logs where timetable is null (not matching lecturer)
    const result = logs.filter((log) => log.timetable !== null);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch teaching logs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/teaching-logs
 * Tạo teaching log mới (user chỉ có thể tạo log cho timetable của mình)
 */
export async function POST(request: Request) {
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

    const contentType = request.headers.get("content-type") || "";
    let body: Record<string, any> = {};
    let base64Images: string[] = [];

    if (contentType.includes("application/json")) {
      body = await request.json();
      if (body.images && Array.isArray(body.images)) {
        base64Images = body.images; // Keep as base64 for now
      }
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body = {} as Record<string, any>;

      for (const [key, value] of formData.entries()) {
        if (key === "images" && value instanceof File) {
          const arrayBuffer = await value.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          base64Images.push(buffer.toString("base64"));
        } else if (!(value instanceof File)) {
          body[key] = value;
        }
      }
    }

    // Verify that the timetable belongs to the user
    if (body.timetable) {
      const Timetable = (await import("@/models/Timetable")).default;
      const timetable = await Timetable.findById(body.timetable);

      if (!timetable) {
        return NextResponse.json(
          { error: "Timetable not found" },
          { status: 404 }
        );
      }

      if (timetable.lecturer?.toString() !== auth.userId) {
        return NextResponse.json(
          {
            error: "You don't have permission to create log for this timetable",
          },
          { status: 403 }
        );
      }
    }

    // Upload images to ImgBB and get URLs
    if (base64Images.length > 0) {
      const imageUrls = await uploadImagesToImgBB(base64Images);
      body.images = imageUrls;
    } else {
      body.images = [];
    }

    const created = await TeachingLog.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create teaching log" },
      { status: 500 }
    );
  }
}
