import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

export async function GET() {
  try {
    await connectDB();

    const appointments = await Appointment.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("GET APPOINTMENTS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}