import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose, { Schema } from "mongoose";

const VideoSchema = new Schema(
  {
    title: { type: String, required: true },
    tag: { type: String, default: "PRODUCT DEMO" },
    desc: { type: String },
    videoUrl: { type: String, required: true },
  },
  { timestamps: true }
);

const Video = mongoose.models.Video || mongoose.model("Video", VideoSchema);

export async function GET() {
  try {
    await connectDB();
    const videos = await Video.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, videos });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, tag, desc, videoUrl } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { success: false, message: "Title and Video URL are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const newVideo = await Video.create({ title, tag, desc, videoUrl });
    return NextResponse.json({ success: true, video: newVideo });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}