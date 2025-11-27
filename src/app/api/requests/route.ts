import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Request from "@/models/Request";
import { User } from "@/models/User";

interface DecodedToken {
  userId: string;
}

function verifyToken(token: string | null | undefined): DecodedToken | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET || "your-secret-key"
    ) as DecodedToken;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");
    const auth = await verifyToken(token);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Không được phép" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin");
    const status = searchParams.get("status");

    if (isAdmin) {
      // Only admins can fetch all requests
      const user = await User.findById(auth.userId);
      if (!user?.roles?.includes("Admin")) {
        return NextResponse.json(
          { error: "Chỉ admin mới được truy cập" },
          { status: 403 }
        );
      }

      const query: Record<string, string> = {};
      if (status === "pending") {
        query.status = "Chờ duyệt";
      }

      const requests = await Request.find(query)
        .populate("user", "name email staff_id")
        .populate("reviewedBy", "name")
        .sort({ createdAt: -1 });

      return NextResponse.json(requests);
    }

    // Regular user - fetch their own requests
    const requests = await Request.find({ user: auth.userId })
      .populate("user", "name email staff_id")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "Lỗi khi tải yêu cầu" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");
    const auth = await verifyToken(token);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Không được phép" }, { status: 401 });
    }

    await connectToDatabase();

    const { title, description, category, priority } = await req.json();

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      );
    }

    const newRequest = await Request.create({
      user: auth.userId,
      title,
      description,
      category,
      priority: priority || "Trung bình",
      status: "Chờ duyệt",
    });

    await newRequest.populate("user", "name email staff_id");

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json({ error: "Lỗi khi tạo yêu cầu" }, { status: 500 });
  }
}
