import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, price, image, category, description, publicId } = body;

    if (!title || !price || !image || !category || !description) {
      return NextResponse.json(
        { success: false, message: "All product fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const newProduct = await Product.create({
      title,
      price,
      image,
      category,
      description,
      publicId: publicId || "",
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create product",
      },
      { status: 500 }
    );
  }
}