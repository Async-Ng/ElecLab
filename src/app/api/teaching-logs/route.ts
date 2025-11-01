export async function POST(request: Request) {
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
  try {
    const created = await TeachingLog.create(body);
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create log" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import TeachingLog from "@/models/TeachingLog";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const userRole = searchParams.get("userRole");
  const lessonId = searchParams.get("lessonId");

  try {
    let query: any = {};

    // Tối ưu: Build query trực tiếp thay vì filter sau
    if (lessonId) {
      query.timetable = lessonId;
    } else if (userRole !== "Admin" && userId) {
      // Join với timetable ngay trong query
      const logs = await TeachingLog.find(query)
        .populate({
          path: "timetable",
          match: { lecturer: userId }, // Filter ngay trong populate
          populate: [
            { path: "lecturer", select: "name email staff_id" },
            { path: "room", select: "name room_id" },
          ],
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      // Filter out logs where timetable is null (not matching lecturer)
      const result = logs.filter((log) => log.timetable !== null);
      return NextResponse.json(result);
    }

    // Admin hoặc có lessonId cụ thể
    const logs = await TeachingLog.find(query)
      .populate({
        path: "timetable",
        populate: [
          { path: "lecturer", select: "name email staff_id" },
          { path: "room", select: "name room_id" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET TEACHING LOGS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch teaching logs" },
      { status: 500 }
    );
  }
}
