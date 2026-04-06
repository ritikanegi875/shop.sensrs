import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { sendMail } from "@/lib/mailer";

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

    const appointmentCode = generateAppointmentCode();

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
      code: appointmentCode,
      status: "pending",
    });

    try {
      await sendMail({
        to: email,
        subject: "Appointment Confirmation - Shop.SEnSRS",
        html: `
          <h2>Appointment Booked Successfully</h2>
          <p>Hello ${fullName},</p>
          <p>Your appointment has been booked successfully.</p>
          <p><strong>Appointment Code:</strong> ${appointmentCode}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time Slot:</strong> ${timeSlot}</p>
          <p><strong>Purpose:</strong> ${message || "General Appointment"}</p>
          <p><strong>Address:</strong><br/>
          ${addressLine}<br/>
          ${city}, ${state} - ${pincode}</p>
          <p><strong>Status:</strong> pending</p>
        `,
      });

      if (process.env.ADMIN_EMAIL) {
        await sendMail({
          to: process.env.ADMIN_EMAIL,
          subject: "New Appointment Booked - Shop.SEnSRS",
          html: `
            <h2>New Appointment Booked</h2>
            <p><strong>Customer:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Appointment Code:</strong> ${appointmentCode}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time Slot:</strong> ${timeSlot}</p>
            <p><strong>Purpose:</strong> ${message || "General Appointment"}</p>
            <p><strong>Address:</strong><br/>
            ${addressLine}<br/>
            ${city}, ${state} - ${pincode}</p>
            <p><strong>Status:</strong> pending</p>
          `,
        });
      } else {
        console.error("ADMIN_EMAIL is missing in .env.local");
      }
    } catch (mailError) {
      console.error("APPOINTMENT MAIL ERROR:", mailError);
    }

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