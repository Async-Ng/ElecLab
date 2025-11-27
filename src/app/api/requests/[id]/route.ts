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

export async function GET(
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

    const request = await Request.findById(params.id)
      .populate("user", "name email staff_id")
      .populate("reviewedBy", "name");

    if (!request) {
      return NextResponse.json(
        { error: "Yêu cầu không tồn tại" },
        { status: 404 }
      );
    }

    // Check permission: user owns the request or is admin
    const user = await User.findById(auth.userId);
    const isOwnRequest = request.user._id.toString() === auth.userId;
    const isAdmin = user?.roles?.includes("Admin");

    if (!isOwnRequest && !isAdmin) {
      return NextResponse.json({ error: "Không được phép" }, { status: 403 });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error("Error fetching request:", error);
    return NextResponse.json({ error: "Lỗi khi tải yêu cầu" }, { status: 500 });
  }
}

export async function DELETE(
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

    const request = await Request.findById(params.id);

    if (!request) {
      return NextResponse.json(
        { error: "Yêu cầu không tồn tại" },
        { status: 404 }
      );
    }

    // Only owner can delete their own pending requests
    if (request.user.toString() !== auth.userId) {
      return NextResponse.json(
        { error: "Không được phép xóa yêu cầu này" },
        { status: 403 }
      );
    }

    if (request.status !== "Chờ duyệt") {
      return NextResponse.json(
        { error: "Chỉ có thể xóa yêu cầu chưa được duyệt" },
        { status: 400 }
      );
    }

    await Request.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Yêu cầu đã bị xóa" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting request:", error);
    return NextResponse.json({ error: "Lỗi khi xóa yêu cầu" }, { status: 500 });
  }
}
