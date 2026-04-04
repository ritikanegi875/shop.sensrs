import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendMail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 1000 * 60 * 30);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;

    const html = `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password.</p>
      <p>Click the link below to set a new password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link will expire in 30 minutes.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `;

    try {
      await sendMail({
        to: user.email,
        subject: "Reset Your Password - Shop.SEnSRS",
        html,
      });
    } catch (mailError) {
      console.error("FORGOT PASSWORD MAIL ERROR:", mailError);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error: any) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Server error during forgot password",
      },
      { status: 500 }
    );
  }
}