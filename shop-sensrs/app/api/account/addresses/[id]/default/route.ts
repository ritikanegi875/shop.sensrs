import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, { params }: Params) {
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

    const { id } = await params;

    await connectDB();

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    let found = false;

    user.addresses.forEach((address: any) => {
      if (String(address._id) === id) {
        address.isDefault = true;
        found = true;
      } else {
        address.isDefault = false;
      }
    });

    if (!found) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Default address updated successfully",
      addresses: user.addresses,
    });
  } catch (error: any) {
    console.error("SET DEFAULT ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to set default address",
      },
      { status: 500 }
    );
  }
}