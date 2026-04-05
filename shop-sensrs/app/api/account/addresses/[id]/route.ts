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
    const body = await req.json();

    await connectDB();

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const address = user.addresses.find(
      (item: any) => String(item._id) === id
    );

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    address.label = body.label || "Home";
    address.fullName = body.fullName || "";
    address.phone = body.phone || "";
    address.addressLine = body.addressLine || "";
    address.city = body.city || "";
    address.state = body.state || "";
    address.pincode = body.pincode || "";

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error: any) {
    console.error("UPDATE ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update address",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
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

    const deletedAddress = user.addresses.find(
      (item: any) => String(item._id) === id
    );

    user.addresses = user.addresses.filter(
      (item: any) => String(item._id) !== id
    );

    if (deletedAddress?.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Address removed successfully",
      addresses: user.addresses,
    });
  } catch (error: any) {
    console.error("DELETE ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to delete address",
      },
      { status: 500 }
    );
  }
}