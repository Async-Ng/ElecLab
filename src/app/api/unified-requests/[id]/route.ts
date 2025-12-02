/**
 * Unified Request Detail APIs
 * GET    /api/unified-requests/[id]           - Get single request
 * PUT    /api/unified-requests/[id]           - Update request (own only)
 * DELETE /api/unified-requests/[id]           - Delete request (own only, pending)
 * PUT    /api/unified-requests/[id]/review    - Review request (admin only)
 * PUT    /api/unified-requests/[id]/handle    - Handle material request (admin only)
 * PUT    /api/unified-requests/[id]/complete  - Complete material request (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RequestUnified } from "@/models/RequestUnified";
import {
  getAuthContext,
  requireAuth,
  requireAdmin,
  isAdmin,
} from "@/lib/apiMiddleware";

/**
 * GET /api/unified-requests/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth(request);
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

    const req = await RequestUnified.findById(id)
      .populate("requester", "name email staff_id")
      .populate("reviewedBy", "name")
      .populate("handledBy", "name")
      .populate("completedBy", "name")
      .populate("materials.material", "material_id name")
      .populate("room", "name room_id");

    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check permissions
    if (
      !isAdmin(auth.userRole) &&
      req.requester._id.toString() !== auth.userId
    ) {
      return NextResponse.json(
        { error: "Không có quyền xem yêu cầu này" },
        { status: 403 }
      );
    }

    return NextResponse.json(req);
  } catch (error) {
    console.error("GET /api/unified-requests/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/unified-requests/[id]
 * User update own request (chỉ khi pending)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth(request);
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

    // Check permission
    if (req.requester.toString() !== auth.userId) {
      return NextResponse.json(
        { error: "Chỉ có thể cập nhật yêu cầu của mình" },
        { status: 403 }
      );
    }

    // Check status - chỉ edit khi pending
    if (req.status !== "Chờ duyệt") {
      return NextResponse.json(
        { error: "Chỉ có thể chỉnh sửa yêu cầu chờ duyệt" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, priority, attachments, materials } = body;

    // Update fields
    if (title) req.title = title;
    if (description) req.description = description;
    if (priority) req.priority = priority;
    if (attachments) req.attachments = attachments;
    if (materials) req.materials = materials;

    await req.save();

    await req.populate("requester", "name email staff_id");
    await req.populate("materials.material", "material_id name");

    return NextResponse.json({
      message: "Request updated successfully",
      data: req,
    });
  } catch (error) {
    console.error("PUT /api/unified-requests/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/unified-requests/[id]
 * User delete own request (chỉ khi pending)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth(request);
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

    // Check permission
    if (req.requester.toString() !== auth.userId) {
      return NextResponse.json(
        { error: "Chỉ có thể xóa yêu cầu của mình" },
        { status: 403 }
      );
    }

    // Check status - chỉ delete khi pending
    if (req.status !== "Chờ duyệt") {
      return NextResponse.json(
        { error: "Chỉ có thể xóa yêu cầu chờ duyệt" },
        { status: 400 }
      );
    }

    await RequestUnified.deleteOne({ _id: id });

    return NextResponse.json({
      message: "Request deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/unified-requests/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
