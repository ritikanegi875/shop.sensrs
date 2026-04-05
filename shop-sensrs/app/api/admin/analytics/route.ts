import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Banner from "@/models/Banner";

export async function GET() {
  try {
    await connectDB();

    const [orders, products, banners] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).lean(),
      Product.find().lean(),
      Banner.find().lean(),
    ]);

    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalBanners = banners.length;

    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + (order.totalPrice || 0);
    }, 0);

    const recentOrders = orders.slice(0, 5);

    return NextResponse.json({
      success: true,
      analytics: {
        totalOrders,
        totalProducts,
        totalBanners,
        totalRevenue,
      },
      recentOrders,
    });
  } catch (error: any) {
    console.error("ADMIN ANALYTICS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch analytics",
      },
      { status: 500 }
    );
  }
}