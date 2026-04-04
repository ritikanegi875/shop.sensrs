import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Appointment from "@/models/Appointment";

export async function GET() {
  try {
    await connectDB();

    const [orders, appointments] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).lean(),
      Appointment.find().sort({ createdAt: -1 }).lean(),
    ]);

    const totalOrders = orders.length;
    const totalAppointments = appointments.length;
    const totalRevenue = orders.reduce(
      (sum: number, order: any) => sum + (order.totalPrice || 0),
      0
    );

    const recentOrders = orders.slice(0, 5);
    const recentAppointments = appointments.slice(0, 5);

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        totalAppointments,
        totalRevenue,
      },
      recentOrders,
      recentAppointments,
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load admin stats" },
      { status: 500 }
    );
  }
}