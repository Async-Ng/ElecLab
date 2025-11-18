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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("authorization");
    const auth = await verifyToken(token);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Không được phép" }, { status: 401 });
    }

    await connectToDatabase();

    // Check admin permission
    const user = await User.findById(auth.userId);
    if (!user?.roles?.includes("Admin")) {
      return NextResponse.json(
        { error: "Chỉ admin mới được phép duyệt yêu cầu" },
        { status: 403 }
      );
    }

    const { status, adminNote } = await req.json();

    if (!status || !["Chấp thuận", "Từ chối"].includes(status)) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    const request = await Request.findById(params.id);

    if (!request) {
      return NextResponse.json(
        { error: "Yêu cầu không tồn tại" },
        { status: 404 }
      );
    }

    if (request.status !== "Chờ duyệt") {
      return NextResponse.json(
        { error: "Yêu cầu này đã được duyệt" },
        { status: 400 }
      );
    }

    // Update request
    request.status = status;
    request.adminNote = adminNote || "";
    request.reviewedBy = auth.userId;
    request.reviewedAt = new Date();

    await request.save();
    await request.populate("user", "name email staff_id");
    await request.populate("reviewedBy", "name");

    return NextResponse.json(request);
  } catch (error) {
    console.error("Error reviewing request:", error);
    return NextResponse.json(
      { error: "Lỗi khi duyệt yêu cầu" },
      { status: 500 }
    );
  }
}
