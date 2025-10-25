import { NextResponse } from "next/server";
import TeachingLog from "@/models/TeachingLog";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  try {
    const log = await TeachingLog.findById(params.id).populate({
      path: "timetable",
      populate: [
        { path: "lecturer", select: "name" },
        { path: "room", select: "name" },
      ],
    });
    if (!log) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch log" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const contentType = request.headers.get("content-type") || "";
  let body: Record<string, any> = {};
  let images: Buffer[] = [];
  if (contentType.includes("application/json")) {
    body = await request.json();
    if (body.images && Array.isArray(body.images)) {
      images = body.images.map((img: string) => Buffer.from(img, "base64"));
    }
  } else if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    body = {} as Record<string, any>;
    for (const [key, value] of formData.entries()) {
      if (key === "images" && value instanceof File) {
        const arrayBuffer = await value.arrayBuffer();
        images.push(Buffer.from(arrayBuffer));
      } else {
        body[key] = value;
      }
    }
  }
  body.images = images;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  try {
    const log = await TeachingLog.findById(params.id).populate({
      path: "timetable",
      select: "lecturer",
    });
    if (!log) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // Chỉ cho phép giảng viên sửa log của chính mình
    const lecturerId =
      typeof log.timetable.lecturer === "object"
        ? log.timetable.lecturer._id?.toString()
        : log.timetable.lecturer;
    if (!userId || userId !== lecturerId)
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    const updated = await TeachingLog.findByIdAndUpdate(params.id, body, {
      new: true,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update log" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  try {
    const deleted = await TeachingLog.findByIdAndDelete(params.id);
    if (!deleted)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete log" },
      { status: 500 }
    );
  }
}
