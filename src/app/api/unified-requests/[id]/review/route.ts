/**
 * PUT /api/unified-requests/[id]/review
 * Admin review request (approve/reject)
 *
 * Body:
 * {
 *   status: "Chấp thuận" | "Từ chối",
 *   reviewNote: string
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

    // Check status - chỉ review khi pending
    if (req.status !== "Chờ duyệt") {
      return NextResponse.json(
        { error: "Chỉ có thể duyệt yêu cầu chờ duyệt" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, reviewNote } = body;

    // Validate status
    if (!["Chấp thuận", "Từ chối"].includes(status)) {
      return NextResponse.json(
        { error: "Status phải là 'Chấp thuận' hoặc 'Từ chối'" },
        { status: 400 }
      );
    }

    // Update request
    req.status = status;
    req.reviewedBy = auth.userId;
    req.reviewedAt = new Date();
    req.reviewNote = reviewNote || "";

    await req.save();

    await req.populate("requester", "name email staff_id");
    await req.populate("reviewedBy", "name");
    await req.populate("materials.material", "material_id name");
    await req.populate("room", "name room_id");

    return NextResponse.json({
      message: `Request ${status === "Chấp thuận" ? "approved" : "rejected"}`,
      data: req,
    });
  } catch (error) {
    console.error("PUT /api/unified-requests/[id]/review error:", error);
    return NextResponse.json(
      { error: "Failed to review request" },
      { status: 500 }
    );
  }
}
