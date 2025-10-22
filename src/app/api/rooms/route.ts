import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { RoomModel } from '@/models/Room';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');

    await connectToDatabase();
    
    let query = {};
    if (userRole !== 'Head_of_deparment') {
      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      query = { users_manage: userId };
    }

    const rooms = await RoomModel.find(query);
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');

    if (userRole !== 'Head_of_deparment') {
      return NextResponse.json(
        { error: 'Unauthorized: Only Head of Department can create rooms' },
        { status: 403 }
      );
    }

    const body = await request.json();
    await connectToDatabase();

    const newRoom = new RoomModel({
      ...body,
      users_manage: body.users_manage || [], // Ensure users_manage is initialized
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