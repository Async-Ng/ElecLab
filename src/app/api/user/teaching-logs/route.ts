import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import TeachingLog from "@/models/TeachingLog";
import { requireAuth, getAuthContext } from "@/lib/apiMiddleware";

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
    console.error("GET /api/user/teaching-logs error:", error);
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
    let images: Buffer[] = [];

    console.log("POST /api/user/teaching-logs - Content-Type:", contentType);

    if (contentType.includes("application/json")) {
      body = await request.json();
      if (body.images && Array.isArray(body.images)) {
        images = body.images.map((img: string) => Buffer.from(img, "base64"));
      }
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body = {} as Record<string, any>;

      console.log("POST /api/user/teaching-logs - FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(
          `  ${key}:`,
          value instanceof File ? `File(${value.name})` : value
        );

        if (key === "images" && value instanceof File) {
          const arrayBuffer = await value.arrayBuffer();
          images.push(Buffer.from(arrayBuffer));
        } else if (!(value instanceof File)) {
          body[key] = value;
        }
      }

      console.log("POST /api/user/teaching-logs - Parsed body:", body);
      console.log(
        "POST /api/user/teaching-logs - Images count:",
        images.length
      );
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

    body.images = images;

    const created = await TeachingLog.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/user/teaching-logs error:", error);
    return NextResponse.json(
      { error: "Failed to create teaching log" },
      { status: 500 }
    );
  }
}
