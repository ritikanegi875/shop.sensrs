import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { sendMail } from "@/lib/mailer";
import {
  getAppointmentAdminEmail,
  getAppointmentUserEmail,
} from "@/lib/email-templates";

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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (
      !body.fullName ||
      !body.email ||
      !body.phone ||
      !body.purpose ||
      !body.date ||
      !body.timeSlot
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required appointment fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingAppointment = await Appointment.findOne({
      date: body.date,
      timeSlot: body.timeSlot,
    });

    if (existingAppointment) {
      return NextResponse.json(
        {
          success: false,
          message: "This time slot is already booked. Please choose another one.",
        },
        { status: 409 }
      );
    }

    const createdAppointment = await Appointment.create({
      code: body.code,
      type: "BOOK_APPOINTMENT",
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      purpose: body.purpose,
      date: body.date,
      timeSlot: body.timeSlot,
      notes: body.notes || "",
    });

    try {
      const userEmail = getAppointmentUserEmail(body);
      const adminEmail = getAppointmentAdminEmail(body);

      await sendMail({
        to: body.email,
        subject: userEmail.subject,
        html: userEmail.html,
      });

      await sendMail({
        to: process.env.ADMIN_EMAIL || "admin@example.com",
        subject: adminEmail.subject,
        html: adminEmail.html,
      });
    } catch (mailError) {
      console.error("MAIL ERROR:", mailError);
    }

    return NextResponse.json({
      success: true,
      message: "Appointment booked successfully",
      code: createdAppointment.code,
      appointmentId: createdAppointment._id,
    });
  } catch (error: any) {
    console.error("APPOINTMENT API ERROR:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "This time slot is already booked. Please choose another one.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Server error while saving appointment",
      },
      { status: 500 }
    );
  }
}