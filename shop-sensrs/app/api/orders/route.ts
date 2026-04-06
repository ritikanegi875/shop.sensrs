import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { sendMail } from "@/lib/mailer";

export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fullName,
      email,
      phone,
      addressLine,
      city,
      state,
      pincode,
      items,
      totalPrice,
    } = body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !addressLine ||
      !city ||
      !state ||
      !pincode ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !totalPrice
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const newOrder = await Order.create({
      fullName,
      email,
      phone,
      addressLine,
      city,
      state,
      pincode,
      items,
      totalPrice,
      status: "pending",
    });

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const itemsHtml = items
          .map(
            (item: {
              title: string;
              quantity: number;
              price: number;
            }) =>
              `<li>${item.title} × ${item.quantity} — ₹${(
                item.price * item.quantity
              ).toLocaleString("en-IN")}</li>`
          )
          .join("");

        // Customer mail
        await sendMail({
          to: email,
          subject: "Order Confirmation - Shop.SEnSRS",
          html: `
            <h2>Order Confirmed</h2>
            <p>Hello ${fullName},</p>
            <p>Your order has been placed successfully.</p>
            <p><strong>Order ID:</strong> ${newOrder._id}</p>
            <p><strong>Total:</strong> ₹${Number(totalPrice).toLocaleString("en-IN")}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Delivery Address:</strong><br/>
            ${addressLine}<br/>
            ${city}, ${state} - ${pincode}</p>
            <h3>Items</h3>
            <ul>${itemsHtml}</ul>
            <p><strong>Status:</strong> pending</p>
          `,
        });

        // Admin mail
        if (process.env.ADMIN_EMAIL) {
          await sendMail({
            to: process.env.ADMIN_EMAIL,
            subject: "New Order Received - Shop.SEnSRS",
            html: `
              <h2>New Order Received</h2>
              <p><strong>Customer Name:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Order ID:</strong> ${newOrder._id}</p>
              <p><strong>Total:</strong> ₹${Number(totalPrice).toLocaleString("en-IN")}</p>
              <p><strong>Delivery Address:</strong><br/>
              ${addressLine}<br/>
              ${city}, ${state} - ${pincode}</p>
              <h3>Items</h3>
              <ul>${itemsHtml}</ul>
              <p><strong>Status:</strong> pending</p>
            `,
          });
        } else {
          console.error("ADMIN_EMAIL is missing in .env.local");
        }
      }
    } catch (mailError) {
      console.error("MAIL ERROR:", mailError);
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error: any) {
    console.error("ORDER ERROR FULL:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Server error",
      },
      { status: 500 }
    );
  }
}