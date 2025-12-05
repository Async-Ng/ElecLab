import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Material } from "@/models/Material";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

/**
 * GET /api/admin/materials
 * Lấy tất cả materials (chỉ admin)
 */
export async function GET(request: NextRequest) {
  console.log("📦 Materials API called");

  // Verify JWT from cookie
  try {
    const token = request.cookies.get("auth_token")?.value;
    console.log("🔑 Token from cookie:", token ? "Found" : "Not found");

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = payload as any;

    console.log("✅ User verified:", {
      userId: user.userId,
      roles: user.roles,
    });

    // Check admin role
    if (!user.roles || !user.roles.includes("Admin")) {
      return NextResponse.json(
        { message: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const materials = await Material.find()
      .populate("place_used", "name room_id")
      .lean()
      .sort({ material_id: 1 })
      .exec();

    return NextResponse.json(materials);
  } catch (error) {
    console.error("❌ Materials API error:", error);
    return NextResponse.json(
      { message: "Unauthorized - Invalid token" },
      { status: 401 }
    );
  }
}

/**
 * POST /api/admin/materials
 * Tạo material mới hoặc import nhiều materials (chỉ admin)
 */
export async function POST(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const data = await request.json();
    await connectToDatabase();

    // Support both single object and array batch import
    if (Array.isArray(data)) {
      // insertMany with ordered:false so other docs still insert if some fail
      const res = await Material.insertMany(data, { ordered: false });
      return NextResponse.json(
        { insertedCount: res.length, inserted: res },
        { status: 201 }
      );
    } else {
      const material = await Material.create(data);
      return NextResponse.json(material, { status: 201 });
    }
  } catch (err: any) {
    // Handle duplicate key errors gracefully
    if (err && err.code === 11000) {
      const insertedCount = err.result?.nInserted ?? 0;
      return NextResponse.json(
        { message: "Duplicate key error", insertedCount },
        { status: 207 }
      );
    }
    console.error("POST /api/admin/materials error:", err);
    return NextResponse.json(
      { message: "Import failed", error: String(err) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/materials
 * Cập nhật material (chỉ admin)
 */
export async function PUT(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updated = await Material.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/admin/materials error:", error);
    return NextResponse.json(
      { error: "Failed to update material" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/materials
 * Xóa material (chỉ admin)
 */
export async function DELETE(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deleted = await Material.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/materials error:", error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
