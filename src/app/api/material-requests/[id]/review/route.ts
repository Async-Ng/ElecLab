import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import MaterialRequest from "@/models/MaterialRequest";
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
    const auth = verifyToken(token);
    if (!auth?.userId) {
      return NextResponse.json({ error: "Không được phép" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(auth.userId);
    if (!user?.roles?.includes("Admin")) {
      return NextResponse.json(
        { error: "Chỉ admin mới được phép duyệt yêu cầu" },
        { status: 403 }
      );
    }

    const { status, reviewNote } = await req.json();

    if (!status || !["Chấp thuận", "Từ chối"].includes(status)) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    const request = await MaterialRequest.findById(params.id);

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

    request.status = status;
    request.reviewNote = reviewNote || "";
    request.reviewedBy = auth.userId;
    request.reviewedAt = new Date();

    await request.save();
    await request.populate("requester", "name email staff_id");
    await request.populate("materials.material");
    await request.populate("room");
    await request.populate("reviewedBy", "name");

    return NextResponse.json(request);
  } catch (error) {
    console.error("Error reviewing material request:", error);
    return NextResponse.json(
      { error: "Lỗi khi duyệt yêu cầu" },
      { status: 500 }
    );
  }
}
