import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { sendMail } from "@/lib/mailer";
import {
  getBuyNowAdminEmail,
  getBuyNowUserEmail,
} from "@/lib/email-templates";

export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
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
      !body.address ||
      !body.city ||
      !body.state ||
      !body.pincode ||
      !body.items ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required order fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingOrder = await Order.findOne({ code: body.code });

    if (existingOrder) {
      return NextResponse.json(
        { success: false, message: "Order code already exists" },
        { status: 409 }
      );
    }

    const createdOrder = await Order.create({
      code: body.code,
      type: "BUY_NOW",
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      address: body.address,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      notes: body.notes || "",
      items: body.items,
      totalPrice: body.totalPrice,
    });

    try {
      const userEmail = getBuyNowUserEmail(body);
      const adminEmail = getBuyNowAdminEmail(body);

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
      message: "Order saved successfully",
      code: createdOrder.code,
      orderId: createdOrder._id,
    });
  } catch (error: any) {
    console.error("ORDER API ERROR FULL:", error);
    console.error("ORDER API ERROR MESSAGE:", error?.message);
    console.error("ORDER API ERROR STACK:", error?.stack);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Server error while saving order",
      },
      { status: 500 }
    );
  }
}