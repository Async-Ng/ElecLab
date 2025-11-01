import { NextResponse } from "next/server";
import { Binary } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

// GET all users (only for admin)

export async function GET() {
  try {
    await connectToDatabase();
    // Tối ưu: Sử dụng lean() để trả về plain objects thay vì Mongoose documents
    // Chỉ select các fields cần thiết
    const users = await User.find({}).select("-password").lean().exec();

    const usersWithAvatar = users.map((u: any) => {
      const avatar = u.avatar;
      if (avatar) {
        // Nếu avatar là Binary của MongoDB
        if (avatar instanceof Binary) {
          // Lấy buffer từ Binary
          const buffer = avatar.buffer as Buffer;
          u.avatar = buffer.toString("base64");
        }
        // Nếu avatar là Buffer thật
        else if (Buffer.isBuffer(avatar)) {
          u.avatar = avatar.toString("base64");
        } else {
          u.avatar = null;
        }
      } else {
        u.avatar = null;
      }

      return u;
    });

    return NextResponse.json(usersWithAvatar);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { message: "Lỗi khi lấy danh sách người dùng" },
      { status: 500 }
    );
  }
}

// POST - Create new user
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
        { message: "Mã nhân viên hoặc email đã tồn tại" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    body.password = await bcrypt.hash(body.password, salt);

    // Nếu có avatar là base64, lưu đúng chuẩn như log
    if (body.avatar) {
      if (typeof body.avatar === "string") {
        // Nếu có prefix thì tách, nếu không thì dùng luôn
        const base64 = body.avatar.includes(",")
          ? body.avatar.split(",")[1]
          : body.avatar;
        body.avatar = Buffer.from(base64, "base64");
      } else if (body.avatar instanceof ArrayBuffer) {
        body.avatar = Buffer.from(body.avatar);
      }
    }
    const user = await User.create(body);
    const userWithoutPassword = { ...user.toObject(), password: undefined };
    // Trả về avatar là base64 để frontend hiển thị
    if (user.avatar) {
      userWithoutPassword.avatar = `data:image/png;base64,${user.avatar.toString(
        "base64"
      )}`;
    }
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { message: "Lỗi khi tạo người dùng" },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json();
    // Nếu avatar là base64, lưu đúng chuẩn như log
    if (updateData.avatar) {
      if (typeof updateData.avatar === "string") {
        const base64 = updateData.avatar.includes(",")
          ? updateData.avatar.split(",")[1]
          : updateData.avatar;
        updateData.avatar = Buffer.from(base64, "base64");
      } else if (updateData.avatar instanceof ArrayBuffer) {
        updateData.avatar = Buffer.from(updateData.avatar);
      }
    }
    await connectToDatabase();

    // If password is being updated, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      select: "-password",
    });
    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }
    // Trả về avatar là base64 (không prefix)
    const userObj = user.toObject();
    if (userObj.avatar && Buffer.from(userObj.avatar).length > 0) {
      userObj.avatar = Buffer.from(userObj.avatar).toString("base64");
    } else {
      userObj.avatar = null;
    }
    return NextResponse.json(userObj);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Lỗi khi cập nhật người dùng" },
      { status: 500 }
    );
  }
}

// DELETE - Remove user
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await connectToDatabase();

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Lỗi khi xóa người dùng" },
      { status: 500 }
    );
  }
}
