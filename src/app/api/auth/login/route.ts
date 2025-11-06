import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    // Validate password exists and is a string
    if (!user.password || typeof user.password !== "string") {
      console.error("LOGIN ERROR: Invalid password field for user:", {
        userId: user._id,
        email: user.email,
        passwordType: typeof user.password,
        password: user.password,
      });
      return NextResponse.json(
        { message: "Lỗi hệ thống: Không tìm thấy mật khẩu người dùng" },
        { status: 500 }
      );
    }

    // Check password
    let validPassword = false;
    try {
      validPassword = await bcrypt.compare(password, user.password);
    } catch (bcryptError: any) {
      console.error("BCRYPT ERROR:", {
        error: bcryptError.message,
        passwordLength: user.password.length,
        inputPasswordLength: password.length,
      });
      return NextResponse.json(
        { message: "Lỗi xác thực mật khẩu" },
        { status: 500 }
      );
    }

    if (!validPassword) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        roles: user.roles,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return user info and token
    return NextResponse.json({
      token,
      user: {
        _id: user._id,
        staff_id: user.staff_id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        rooms_manage: user.rooms_manage,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Đã có lỗi xảy ra" }, { status: 500 });
  }
}
