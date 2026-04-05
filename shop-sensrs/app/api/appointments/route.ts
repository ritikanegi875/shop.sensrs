import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

function generateAppointmentCode() {
  return `APT-${Date.now().toString().slice(-6)}`;
}

export async function GET() {
  try {
    await connectDB();

    const appointments = await Appointment.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error: any) {
    console.error("GET APPOINTMENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch appointments",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fullName = body.fullName?.trim() || "";
    const email = body.email?.trim() || "";
    const phone = body.phone?.trim() || "";
    const addressLine = body.addressLine?.trim() || "";
    const city = body.city?.trim() || "";
    const state = body.state?.trim() || "";
    const pincode = body.pincode?.trim() || "";
    const date = body.date?.trim() || "";
    const timeSlot = body.timeSlot?.trim() || "";
    const message = body.message?.trim() || "";

    const missingFields: string[] = [];

    if (!fullName) missingFields.push("fullName");
    if (!email) missingFields.push("email");
    if (!phone) missingFields.push("phone");
    if (!addressLine) missingFields.push("addressLine");
    if (!city) missingFields.push("city");
    if (!state) missingFields.push("state");
    if (!pincode) missingFields.push("pincode");
    if (!date) missingFields.push("date");
    if (!timeSlot) missingFields.push("timeSlot");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required appointment fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    await connectDB();

    const newAppointment = await Appointment.create({
      fullName,
      email,
      phone,
      addressLine,
      city,
      state,
      pincode,
      date,
      timeSlot,
      message,
      purpose: message || "General Appointment",
      code: generateAppointmentCode(),
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (error: any) {
    console.error("APPOINTMENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to book appointment",
      },
      { status: 500 }
    );
  }
}