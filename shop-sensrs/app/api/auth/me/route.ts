import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({
        success: true,
        user: null,
      });
    }

    const decoded = verifyToken(token);

    return NextResponse.json({
      success: true,
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      user: null,
    });
  }
}