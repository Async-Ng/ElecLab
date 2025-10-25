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
  const body = await request.json();
  try {
    const updated = await TeachingLog.findByIdAndUpdate(params.id, body, {
      new: true,
    });
    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
