import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { success: false, message: "Date is required" },
        { status: 400 }
      );
    }

    const appointments = await Appointment.find(
      { date },
      { timeSlot: 1, _id: 0 }
    );

    const bookedSlots = appointments.map((item) => item.timeSlot);

    return NextResponse.json({
      success: true,
      bookedSlots,
    });
  } catch (error) {
    console.error("GET BOOKED SLOTS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch booked slots" },
      { status: 500 }
    );
  }
}