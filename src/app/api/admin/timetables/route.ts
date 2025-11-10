import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Timetable from "@/models/Timetable";
import { requireAdmin } from "@/lib/apiMiddleware";
import {
  isWeekValidForSemester,
  isValidDateFormat,
  getWeekValidationError,
  getDateValidationError,
} from "@/shared/utils/semesterValidation";

/**
 * GET /api/admin/timetables
 * Lấy tất cả timetables (chỉ admin)
 */
export async function GET(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    await connectToDatabase();

    const timetables = await Timetable.find()
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
 * POST /api/admin/timetables
 * Tạo timetable mới hoặc import nhiều timetables (chỉ admin)
 */
export async function POST(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    await connectToDatabase();

    // Validation function
    const validateTimetable = (tt: any): string | null => {
      // Validate date format
      const dateError = getDateValidationError(tt.date);
      if (dateError) return dateError;

      // Validate week for semester
      const weekError = getWeekValidationError(tt.semester, tt.week);
      if (weekError) return weekError;

      return null;
    };

    // Validate all entries before inserting
    if (Array.isArray(body)) {
      for (let i = 0; i < body.length; i++) {
        const error = validateTimetable(body[i]);
        if (error) {
          return NextResponse.json(
            { error: `Dòng ${i + 2}: ${error}` },
            { status: 400 }
          );
        }
      }
    } else {
      const error = validateTimetable(body);
      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }
    }

    let result;
    if (Array.isArray(body)) {
      result = await Timetable.insertMany(body);
    } else {
      result = await Timetable.create(body);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/timetables error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create timetable" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/timetables
 * Cập nhật timetable (chỉ admin)
 */
export async function PUT(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { _id, ...updateData } = await request.json();

    if (!_id) {
      return NextResponse.json(
        { error: "Timetable ID is required" },
        { status: 400 }
      );
    }

    // Validate week for semester if both are provided
    if (updateData.semester !== undefined && updateData.week !== undefined) {
      const error = getWeekValidationError(
        updateData.semester,
        updateData.week
      );
      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }
    }

    // Validate date format if provided
    if (updateData.date !== undefined) {
      const error = getDateValidationError(updateData.date);
      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }
    }

    await connectToDatabase();

    const updated = await Timetable.findByIdAndUpdate(_id, updateData, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Timetable not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/admin/timetables error:", error);
    return NextResponse.json(
      { error: "Failed to update timetable" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/timetables
 * Xóa timetable (chỉ admin)
 */
export async function DELETE(request: Request) {
  // Check admin authorization
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Timetable ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deleted = await Timetable.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Timetable not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Timetable deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/timetables error:", error);
    return NextResponse.json(
      { error: "Failed to delete timetable" },
      { status: 500 }
    );
  }
}
