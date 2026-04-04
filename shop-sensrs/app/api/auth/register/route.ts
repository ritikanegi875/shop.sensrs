import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("REGISTER BODY:", body);

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
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
    console.log("REGISTER DB CONNECTED");

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });
    console.log("EXISTING USER:", existingUser);

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    console.log("HASHED PASSWORD CREATED");

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
    });

    console.log("NEW USER CREATED:", newUser);

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error("REGISTER ERROR FULL:", error);
    console.error("REGISTER ERROR MESSAGE:", error?.message);
    console.error("REGISTER ERROR STACK:", error?.stack);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Server error during registration",
      },
      { status: 500 }
    );
  }
}