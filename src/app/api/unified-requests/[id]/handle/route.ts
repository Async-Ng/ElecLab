/**
 * PUT /api/unified-requests/[id]/handle
 * Admin handle material request (mark as processing)
 * Chỉ dùng cho material requests (Cấp phát vật tư, Sửa chữa vật tư)
 *
 * Body:
 * {
 *   // No additional data needed, just status change
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RequestUnified } from "@/models/RequestUnified";
import { getAuthContext, requireAdmin } from "@/lib/apiMiddleware";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const auth = getAuthContext(request);

    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const req = await RequestUnified.findById(id);
    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check if material request
    if (req.type !== "Cấp phát vật tư" && req.type !== "Sửa chữa vật tư") {
      return NextResponse.json(
        { error: "Chỉ có thể handle yêu cầu vật tư" },
        { status: 400 }
      );
    }

    // Check status - chỉ handle khi approved
    if (req.status !== "Chấp thuận") {
      return NextResponse.json(
        { error: "Chỉ có thể bắt đầu xử lý yêu cầu đã chấp thuận" },
        { status: 400 }
      );
    }

    // Update to processing
    req.status = "Đang xử lý";
    req.handledBy = auth.userId;
    req.handledAt = new Date();

    await req.save();

    await req.populate("requester", "name email staff_id");
    await req.populate("handledBy", "name");
    await req.populate("materials.material", "material_id name");
    await req.populate("room", "name room_id");

    return NextResponse.json({
      message: "Request marked as processing",
      data: req,
    });
  } catch (error) {
    console.error("PUT /api/unified-requests/[id]/handle error:", error);
    return NextResponse.json(
      { error: "Failed to handle request" },
      { status: 500 }
    );
  }
}
