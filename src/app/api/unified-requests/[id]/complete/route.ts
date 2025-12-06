/**
 * PUT /api/unified-requests/[id]/complete
 * Admin complete material request
 * Chỉ dùng cho material requests (Cấp phát vật tư, Sửa chữa vật tư)
 *
 * Body:
 * {
 *   completionNote: string
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
        { error: "Chỉ có thể hoàn thành yêu cầu vật tư" },
        { status: 400 }
      );
    }

    // Check status - chỉ complete khi processing
    if (req.status !== "Đang xử lý") {
      return NextResponse.json(
        { error: "Chỉ có thể hoàn thành yêu cầu đang xử lý" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { completionNote } = body;

    // Update to completed
    req.status = "Hoàn thành";
    req.completedBy = auth.userId;
    req.completedAt = new Date();
    req.completionNote = completionNote || "";

    await req.save();

    await req.populate("requester", "name email staff_id");
    await req.populate("completedBy", "name");
    await req.populate("materials.material", "material_id name");
    await req.populate("room", "name room_id");

    return NextResponse.json({
      message: "Request completed successfully",
      data: req,
    });
  } catch (error) {
    console.error("PUT /api/unified-requests/[id]/complete error:", error);
    return NextResponse.json(
      { error: "Failed to complete request" },
      { status: 500 }
    );
  }
}
