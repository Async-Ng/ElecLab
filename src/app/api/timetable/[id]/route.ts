// app/api/timetable/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Timetable from "@/models/Timetable";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = params;
    const body = await request.json();

    // Nếu có ảnh upload từ antd (fileList)
    if (body.incidentImages && Array.isArray(body.incidentImages)) {
      body.incidentImages = body.incidentImages.map((item: any) => {
        // Antd Upload có 2 dạng: { url } hoặc { originFileObj }
        if (item.url) return item.url; // đã có link ảnh
        if (item.originFileObj) {
          // Convert ảnh sang base64 (chỉ khi bạn không có storage riêng)
          const base64 = Buffer.from(item.originFileObj).toString("base64");
          return `data:${item.type};base64,${base64}`;
        }
        return item;
      });
    }

    const timetable = await Timetable.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!timetable) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy thời khóa biểu" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: timetable });
  } catch (error: any) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
