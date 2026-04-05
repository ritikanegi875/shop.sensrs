import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token) as {
      userId: string;
      email: string;
      role: string;
    };

    await connectDB();

    const appointments = await Appointment.find({
      email: decoded.email,
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Fetch failed" },
      { status: 500 }
    );
  }
}