import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Timetable from "@/models/Timetable";
import { requireAuth, getAuthContext } from "@/lib/apiMiddleware";

/**
 * GET /api/user/timetables
 * Lấy timetables của user (chỉ xem timetables mà user là lecturer)
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

    await connectToDatabase();

    // User chỉ xem timetables của mình
    const timetables = await Timetable.find({ lecturer: auth.userId })
      .populate("room", "name room_id")
      .populate("lecturer", "name email staff_id")
      .lean()
      .sort({ date: -1, period: 1 })
      .exec();

    return NextResponse.json(timetables);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch timetables" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/timetables
 * Cập nhật timetable (user chỉ có thể update timetable của mình)
 */
export async function PUT(request: Request) {
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

    const { _id, ...updateData } = await request.json();

    if (!_id) {
      return NextResponse.json(
        { error: "Timetable ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Kiểm tra xem timetable có thuộc về user không
    const timetable = await Timetable.findById(_id);
    if (!timetable) {
      return NextResponse.json(
        { error: "Timetable not found" },
        { status: 404 }
      );
    }

    if (timetable.lecturer?.toString() !== auth.userId) {
      return NextResponse.json(
        { error: "You don't have permission to edit this timetable" },
        { status: 403 }
      );
    }

    const updated = await Timetable.findByIdAndUpdate(_id, updateData, {
      new: true,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update timetable" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/timetables
 * Tạo mới timetable (user tạo timetable cho chính mình)
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

    const data = await request.json();

    // Nếu là array (bulk import)
    if (Array.isArray(data)) {
      await connectToDatabase();

      // Đảm bảo tất cả timetables đều có lecturer là user hiện tại
      const timetablesData = data.map((item) => ({
        ...item,
        lecturer: auth.userId, // Force lecturer là user hiện tại
      }));

      const created = await Timetable.insertMany(timetablesData);
      return NextResponse.json(created, { status: 201 });
    }

    // Nếu là object đơn lẻ
    await connectToDatabase();

    const timetableData = {
      ...data,
      lecturer: auth.userId, // Force lecturer là user hiện tại
    };

    const created = await Timetable.create(timetableData);
    const populated = await Timetable.findById(created._id)
      .populate("room", "name room_id")
      .populate("lecturer", "name email staff_id")
      .lean()
      .exec();

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create timetable" },
      { status: 500 }
    );
  }
}
