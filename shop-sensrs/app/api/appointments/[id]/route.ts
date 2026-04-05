import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    const allowedStatuses = ["pending", "approved", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid appointment status" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
    });
  } catch (error: any) {
    console.error("UPDATE APPOINTMENT STATUS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update appointment status",
      },
      { status: 500 }
    );
  }
}