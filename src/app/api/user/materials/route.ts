import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Material } from "@/models/Material";
import { requireAuth } from "@/lib/apiMiddleware";

/**
 * GET /api/user/materials
 * Lấy tất cả materials (read-only cho user)
 */
export async function GET(request: Request) {
  // Check user authentication
  const authError = requireAuth(request);
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
    console.error("GET /api/user/materials error:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}
