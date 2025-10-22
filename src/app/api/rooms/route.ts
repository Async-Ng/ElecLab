import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { RoomModel } from '@/models/Room';

export async function GET() {
  try {
    await connectToDatabase();
    const rooms = await RoomModel.find({});
    return NextResponse.json({ rooms }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const newRoom = new RoomModel({
      ...body,
      id: Date.now().toString(), // You might want to use a more robust ID generation method
    });

    await newRoom.save();
    return NextResponse.json({ room: newRoom }, { status: 201 });
  } catch (error) {
    console.error('Failed to create room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}