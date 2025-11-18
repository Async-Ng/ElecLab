import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import MaterialRequest from "@/models/MaterialRequest";

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

    const requests = await MaterialRequest.find({ requester: auth.userId })
      .populate("requester", "name email staff_id")
      .populate("materials.material")
      .populate("room")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching my material requests:", error);
    return NextResponse.json(
      { error: "Lỗi khi tải yêu cầu của bạn" },
      { status: 500 }
    );
  }
}
