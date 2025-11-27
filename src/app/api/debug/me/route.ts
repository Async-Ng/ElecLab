import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
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
      return NextResponse.json(
        { error: "No valid token", token: token?.substring(0, 20) + "..." },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(auth.userId).lean();

    return NextResponse.json({
      userId: auth.userId,
      user: user ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      } : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
