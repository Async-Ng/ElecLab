import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    const users = await User.find({}).select('-password');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy danh sách người dùng' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    // Check if staff_id or email already exists
    const existingUser = await User.findOne({
      $or: [{ staff_id: body.staff_id }, { email: body.email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Mã nhân viên hoặc email đã tồn tại' },
        { status: 400 }
      );
    }

    const user = await User.create(body);
    const userWithoutPassword = { ...user.toObject(), password: undefined };
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { message: 'Lỗi khi tạo người dùng' },
      { status: 500 }
    );
  }
}
