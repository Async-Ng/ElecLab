import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Material } from "@/models/Material";

// GET all materials
export async function GET() {
  await connectToDatabase();
  const materials = await Material.find();
  return NextResponse.json(materials);
}

// POST - Create a new material
export async function POST(req: Request) {
  const data = await req.json();
  await connectToDatabase();
  const material = await Material.create(data);
  return NextResponse.json(material, { status: 201 });
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
