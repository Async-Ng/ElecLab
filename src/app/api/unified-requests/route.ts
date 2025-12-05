/**
 * Unified Requests API
 * GET  /api/unified-requests           - Get user/admin requests
 * POST /api/unified-requests           - Create new request
 * GET  /api/unified-requests/my-requests - Get user's requests (alternative)
 */

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RequestUnified } from "@/models/RequestUnified";
import { User } from "@/models/User";
import { Material } from "@/models/Material";
import { Room } from "@/models/Room";
import { getAuthContext, requireAuth, isAdmin } from "@/lib/apiMiddleware";

/**
 * GET /api/unified-requests
 * Lấy requests (user: own, admin: all)
 * Query params: type, status, priority, skip, limit
 */
export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const auth = getAuthContext(request);
    console.log("🔐 Auth context:", auth);

    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("🔌 Connecting to database...");
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");
    const statusFilter = searchParams.get("status");
    const priorityFilter = searchParams.get("priority");
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");

    const query: any = {};

    // Build query based on user role
    console.log(
      "👤 User role check:",
      auth.userRole,
      "isAdmin:",
      isAdmin(auth.userRole)
    );
    if (!isAdmin(auth.userRole)) {
      // Regular user - only see own requests
      query.requester = auth.userId;
    }

    // Add filters
    if (typeFilter) {
      query.type = typeFilter;
    }
    if (statusFilter) {
      query.status = statusFilter;
    }
    if (priorityFilter) {
      query.priority = priorityFilter;
    }

    // Fetch data
    console.log("📊 Query:", query);
    const total = await RequestUnified.countDocuments(query);
    console.log("📈 Total count:", total);

    const requests = await RequestUnified.find(query)
      .populate("requester", "name email staff_id")
      .populate("reviewedBy", "name")
      .populate("handledBy", "name")
      .populate("completedBy", "name")
      .populate("room", "name room_id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log("✅ Fetched requests:", requests.length);
    return NextResponse.json({
      data: requests,
      total,
      skip,
      limit,
    });
  } catch (error) {
    console.error("❌ GET /api/unified-requests error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch requests",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/unified-requests
 * Tạo request mới (chung hoặc vật tư)
 *
 * Body (General):
 * {
 *   type: "Tài liệu" | "Phòng học" | "Lịch dạy" | "Khác",
 *   title: string,
 *   description: string,
 *   priority?: "Thấp" | "Trung bình" | "Cao",
 *   attachments?: Array<{fileName, fileSize, fileType}>
 * }
 *
 * Body (Material):
 * {
 *   type: "Cấp phát vật tư" | "Sửa chữa vật tư",
 *   title?: string,
 *   description: string,
 *   priority?: "Thấp" | "Trung bình" | "Cao",
 *   materials: Array<{materialId, quantity, reason}>,
 *   roomId?: string (for repairs)
 * }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      type,
      title,
      description,
      priority,
      attachments,
      materials,
      roomId,
    } = body;

    // Validation
    if (!type || !description) {
      return NextResponse.json(
        { error: "Type và description là bắt buộc" },
        { status: 400 }
      );
    }

    const validTypes = [
      "Tài liệu",
      "Phòng học",
      "Lịch dạy",
      "Khác",
      "Cấp phát vật tư",
      "Sửa chữa vật tư",
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type: ${type}` },
        { status: 400 }
      );
    }

    // Check material-specific requirements
    if (type === "Cấp phát vật tư" || type === "Sửa chữa vật tư") {
      if (!materials || !Array.isArray(materials) || materials.length === 0) {
        return NextResponse.json(
          { error: "Materials là bắt buộc cho yêu cầu vật tư" },
          { status: 400 }
        );
      }
    }

    // Build request object
    const requestData: any = {
      requester: auth.userId,
      type,
      title: title || `${type} - ${description.substring(0, 50)}`,
      description,
      priority: priority || "Trung bình",
      status: "Chờ duyệt",
      attachments: attachments || [],
      materials: materials || [],
      room: roomId || null,
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: "",
      adminNote: "",
      handledBy: null,
      handledAt: null,
      completedBy: null,
      completedAt: null,
      completionNote: "",
    };

    // Create request
    const newRequest = await RequestUnified.create(requestData);

    // Populate fields
    await newRequest.populate("requester", "name email staff_id");
    await newRequest.populate("materials.material", "material_id name");
    await newRequest.populate("room", "name room_id");

    return NextResponse.json(
      {
        message: "Request created successfully",
        data: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/unified-requests error:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
