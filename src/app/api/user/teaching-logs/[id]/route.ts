import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import TeachingLog from "@/models/TeachingLog";
import { requireAuth, getAuthContext } from "@/lib/apiMiddleware";
import { uploadImagesToImgBB } from "@/lib/imgbb";

/**
 * PUT /api/user/teaching-logs/[id]
 * Cập nhật teaching log (user chỉ có thể update log của timetable mà mình là lecturer)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
        base64Images = body.images;
      }
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body = {} as Record<string, any>;

      for (const [key, value] of formData.entries()) {
        if (key === "images" && value instanceof File) {
          const bytes = await value.arrayBuffer();
          base64Images.push(Buffer.from(bytes).toString("base64"));
        } else {
          body[key] = value;
        }
      }
    }

    // Tìm log hiện tại và kiểm tra quyền
    const existingLog = await TeachingLog.findById(id)
      .populate("timetable")
      .exec();

    if (!existingLog) {
      return NextResponse.json(
        { error: "Teaching log not found" },
        { status: 404 }
      );
    }

    // Kiểm tra quyền sở hữu
    const timetable = existingLog.timetable as any;
    if (timetable?.lecturer?.toString() !== auth.userId) {
      return NextResponse.json(
        { error: "You don't have permission to update this teaching log" },
        { status: 403 }
      );
    }

    // Chuẩn bị data để update
    const updateData: Record<string, any> = {
      note: body.note || "",
      status: body.status || "NORMAL",
      updatedAt: new Date(),
    };

    // Upload new images to ImgBB if provided
    if (base64Images.length > 0) {
      const imageUrls = await uploadImagesToImgBB(base64Images);
      updateData.images = imageUrls;
    }

    // Update log
    const updated = await TeachingLog.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate({
        path: "timetable",
        populate: [
          { path: "lecturer", select: "name email staff_id" },
          { path: "room", select: "name room_id" },
        ],
      })
      .exec();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update teaching log" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/teaching-logs/[id]
 * Xóa teaching log (user chỉ có thể xóa log của timetable mà mình là lecturer)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Tìm log hiện tại và kiểm tra quyền
    const existingLog = await TeachingLog.findById(id)
      .populate("timetable")
      .exec();

    if (!existingLog) {
      return NextResponse.json(
        { error: "Teaching log not found" },
        { status: 404 }
      );
    }

    // Kiểm tra quyền sở hữu
    const timetable = existingLog.timetable as any;
    if (timetable?.lecturer?.toString() !== auth.userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this teaching log" },
        { status: 403 }
      );
    }

    // Xóa log
    await TeachingLog.findByIdAndDelete(id);

    return NextResponse.json({ message: "Teaching log deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete teaching log" },
      { status: 500 }
    );
  }
}
