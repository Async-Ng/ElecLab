import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Material } from "@/models/Material";
import { requireAdmin } from "@/lib/apiMiddleware";

/**
 * GET /api/admin/materials
 * Lấy tất cả materials (chỉ admin)
 */
export async function GET(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    await connectToDatabase();

    const materials = await Material.find()
      .populate("place_used", "name room_id")
      .lean()
      .sort({ material_id: 1 })
      .exec();

    return NextResponse.json(materials);
  } catch (error) {
    console.error("GET /api/admin/materials error:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
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
