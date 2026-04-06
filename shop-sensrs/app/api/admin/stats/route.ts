import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Appointment from "@/models/Appointment";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const [orders, appointments, users] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).lean(),
      Appointment.find().sort({ createdAt: -1 }).lean(),
      User.find().lean(),
    ]);

    const totalOrders = orders.length;
    const totalAppointments = appointments.length;
    const totalUsers = users.length;

    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + (order.totalPrice || 0);
    }, 0);

    const pendingOrders = orders.filter(
      (order: any) => (order.status || "pending") === "pending"
    ).length;

    const pendingAppointments = appointments.filter(
      (appointment: any) => (appointment.status || "pending") === "pending"
    ).length;

    const recentOrders = orders.slice(0, 5);
    const recentAppointments = appointments.slice(0, 5);

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        totalAppointments,
        totalUsers,
        totalRevenue,
        pendingOrders,
        pendingAppointments,
      },
      recentOrders,
      recentAppointments,
    });
  } catch (error: any) {
    console.error("ADMIN STATS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch admin stats",
      },
      { status: 500 }
    );
  }
}