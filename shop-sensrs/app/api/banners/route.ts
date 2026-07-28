import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Banner from "@/models/Banner";

export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      banners,
    });
  } catch (error) {
    console.error("GET BANNERS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // CHANGED: We now look for 'category'
    const { imageUrl, publicId, category } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: "Image URL is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const bannerCategory = category || "hero";

    // Clear out old banner-two if a new one is uploaded
    if (bannerCategory === "banner-two") {
      await Banner.deleteMany({ category: "banner-two" });
    }

    const newBanner = await Banner.create({
      imageUrl,
      publicId: publicId || "",
      isActive: true,
      category: bannerCategory, // Save it as category
    });

    return NextResponse.json({
      success: true,
      message: "Banner created successfully",
      banner: newBanner,
    });
  } catch (error: any) {
    console.error("CREATE BANNER ERROR:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Banner id is required" },
        { status: 400 }
      );
    }

    await connectDB();
    await Banner.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE BANNER ERROR:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete banner" },
      { status: 500 }
    );
  }
}