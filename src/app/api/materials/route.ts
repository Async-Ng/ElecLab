import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Material } from "@/models/Material";

// GET all materials
export async function GET() {
  await connectToDatabase();
  const materials = await Material.find().populate("place_used", "name");
  return NextResponse.json(materials);
}

// POST - Create a new material
export async function POST(req: Request) {
  const data = await req.json();
  await connectToDatabase();
  // Support both single object and array batch import
  try {
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
      // For insertMany with ordered:false, Mongo returns a BulkWriteError
      // We'll return partial success info when possible
      const insertedCount = err.result?.nInserted ?? 0;
      return NextResponse.json(
        { message: "Duplicate key error", insertedCount },
        { status: 207 }
      );
    }
    console.error(err);
    return NextResponse.json(
      { message: "Import failed", error: String(err) },
      { status: 500 }
    );
  }
}

// PUT - Update a material
export async function PUT(req: Request) {
  const { id, ...updateData } = await req.json();
  await connectToDatabase();
  const updated = await Material.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!updated)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

// DELETE - Remove a material
export async function DELETE(req: Request) {
  const { id } = await req.json();
  await connectToDatabase();
  const deleted = await Material.findByIdAndDelete(id);
  if (!deleted)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted successfully" });
}
