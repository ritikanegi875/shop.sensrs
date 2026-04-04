import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Appointment from "@/models/Appointment";

function formatOrderItems(
  items: { title: string; quantity: number; price: number }[]
) {
  return items
    .map(
      (item) =>
        `${item.title} x ${item.quantity} (₹${(
          item.price * item.quantity
        ).toLocaleString("en-IN")})`
    )
    .join(" | ");
}

export async function GET() {
  try {
    await connectDB();

    const [orders, appointments] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).lean(),
      Appointment.find().sort({ createdAt: -1 }).lean(),
    ]);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Records");

    worksheet.columns = [
      { header: "Record Type", key: "recordType", width: 20 },
      { header: "Code", key: "code", width: 18 },
      { header: "Full Name", key: "fullName", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 18 },
      { header: "Address", key: "address", width: 35 },
      { header: "City", key: "city", width: 20 },
      { header: "State", key: "state", width: 20 },
      { header: "Pincode", key: "pincode", width: 14 },
      { header: "Purpose", key: "purpose", width: 30 },
      { header: "Appointment Date", key: "appointmentDate", width: 18 },
      { header: "Appointment Time Slot", key: "appointmentTimeSlot", width: 28 },
      { header: "Items Summary", key: "itemsSummary", width: 60 },
      { header: "Total Price", key: "totalPrice", width: 16 },
      { header: "Notes", key: "notes", width: 30 },
      { header: "Created At", key: "createdAt", width: 24 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    for (const order of orders as any[]) {
      worksheet.addRow({
        recordType: "BUY_NOW",
        code: order.code,
        fullName: order.fullName,
        email: order.email,
        phone: order.phone,
        address: order.address,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        purpose: "",
        appointmentDate: "",
        appointmentTimeSlot: "",
        itemsSummary: formatOrderItems(order.items || []),
        totalPrice: order.totalPrice,
        notes: order.notes || "",
        createdAt: new Date(order.createdAt).toLocaleString("en-IN"),
      });
    }

    for (const appointment of appointments as any[]) {
      worksheet.addRow({
        recordType: "BOOK_APPOINTMENT",
        code: appointment.code,
        fullName: appointment.fullName,
        email: appointment.email,
        phone: appointment.phone,
        address: "",
        city: "",
        state: "",
        pincode: "",
        purpose: appointment.purpose,
        appointmentDate: appointment.date,
        appointmentTimeSlot: appointment.timeSlot,
        itemsSummary: "",
        totalPrice: "",
        notes: appointment.notes || "",
        createdAt: new Date(appointment.createdAt).toLocaleString("en-IN"),
      });
    }

    worksheet.eachRow((row) => {
      row.alignment = { vertical: "top", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="shop-sensrs-records.xlsx"',
      },
    });
  } catch (error) {
    console.error("EXPORT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to generate Excel export" },
      { status: 500 }
    );
  }
}