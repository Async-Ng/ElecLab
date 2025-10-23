import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RoomModel } from "@/models/Room";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const room = await RoomModel.findOne({ _id: params.id });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ room }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const updatedRoom = await RoomModel.findOneAndUpdate(
      { _id: params.id },
      { $set: body },
      { new: true }
    );

    if (!updatedRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ room: updatedRoom }, { status: 200 });
  } catch (error) {
    console.error("Failed to update room:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const deletedRoom = await RoomModel.findOneAndDelete({ _id: params.id });

    if (!deletedRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Room deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
