import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    await connectToDatabase();
    const user = await User.findById(params.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy thông tin người dùng' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const body = await request.json();
    await connectToDatabase();

    // Check if updated staff_id or email conflicts with other users
    const existingUser = await User.findOne({
      _id: { $ne: params.id },
      $or: [{ staff_id: body.staff_id }, { email: body.email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Mã nhân viên hoặc email đã tồn tại' },
        { status: 400 }
      );
    }

    // Remove password field if it's empty
    if (!body.password) {
      delete body.password;
    }

    const user = await User.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { message: 'Lỗi khi cập nhật người dùng' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    await connectToDatabase();
    const user = await User.findByIdAndDelete(params.id);

    if (!user) {
      return NextResponse.json(
        { message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { message: 'Lỗi khi xóa người dùng' },
      { status: 500 }
    );
  }
}
