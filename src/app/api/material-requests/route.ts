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

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");
    const auth = verifyToken(token);
    if (!auth?.userId) {
      return NextResponse.json({ error: "Không được phép" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin");
    const status = searchParams.get("status");

    if (isAdmin) {
      const user = await User.findById(auth.userId);
      if (!user?.roles?.includes("Admin")) {
        return NextResponse.json(
          { error: "Chỉ admin mới được truy cập" },
          { status: 403 }
        );
      }

      const query: Record<string, unknown> = {};
      if (status) {
        const statusMap: Record<string, string> = {
          pending: "Chờ duyệt",
          approved: "Chấp thuận",
          rejected: "Từ chối",
          processing: "Đang xử lý",
          completed: "Hoàn thành",
        };
        query.status = statusMap[status] || status;
      }

      const requests = await MaterialRequest.find(query)
        .populate("requester", "name email staff_id")
        .populate("materials.material")
        .populate("room")
        .populate("reviewedBy", "name")
        .populate("handledBy", "name")
        .populate("completedBy", "name")
        .sort({ createdAt: -1 });

      return NextResponse.json(requests);
    }

    // Regular user - fetch their own requests
    const requests = await MaterialRequest.find({ requester: auth.userId })
      .populate("requester", "name email staff_id")
      .populate("materials.material")
      .populate("room")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching material requests:", error);
    return NextResponse.json({ error: "Lỗi khi tải yêu cầu" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");
    const auth = verifyToken(token);
    if (!auth?.userId) {
      return NextResponse.json({ error: "Không được phép" }, { status: 401 });
    }

    await connectToDatabase();

    const { requestType, materials, roomId, description, priority } =
      await req.json();

    if (!requestType || !materials || !description) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      );
    }

    if (requestType === "Sửa chữa" && !roomId) {
      return NextResponse.json(
        { error: "Vui lòng chọn phòng cho yêu cầu sửa chữa" },
        { status: 400 }
      );
    }

    const materialData = materials.map((m: Record<string, unknown>) => ({
      material: m.materialId,
      quantity: m.quantity,
      reason: m.reason,
    }));

    const newRequest = await MaterialRequest.create({
      requester: auth.userId,
      requestType,
      materials: materialData,
      room: roomId || null,
      description,
      priority: priority || "Trung bình",
      status: "Chờ duyệt",
    });

    await newRequest.populate("requester", "name email staff_id");
    await newRequest.populate("materials.material");
    await newRequest.populate("room");

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating material request:", error);
    return NextResponse.json({ error: "Lỗi khi tạo yêu cầu" }, { status: 500 });
  }
}
