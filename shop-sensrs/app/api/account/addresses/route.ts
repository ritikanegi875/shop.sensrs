import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token) as {
      userId: string;
      email: string;
      role: string;
    };

    const body = await req.json();

    const {
      label,
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
    } = body;

    if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
      return NextResponse.json(
        { success: false, message: "All address fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.addresses) {
      user.addresses = [];
    }

    const hasDefault = user.addresses.some((address: any) => address.isDefault);

    user.addresses.push({
      label: label || "Home",
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault: !hasDefault,
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error: any) {
    console.error("ADD ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to add address",
      },
      { status: 500 }
    );
  }
}