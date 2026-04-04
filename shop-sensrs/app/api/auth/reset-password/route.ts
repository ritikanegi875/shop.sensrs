import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired reset token",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = null;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error: any) {
    console.error("RESET PASSWORD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Server error during password reset",
      },
      { status: 500 }
    );
  }
}