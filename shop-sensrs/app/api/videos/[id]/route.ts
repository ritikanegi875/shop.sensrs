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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    
    // Await params if it's a promise (Next.js requirement for dynamic routes)
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid video ID format" },
        { status: 400 }
      );
    }

    const deletedVideo = await Video.findByIdAndDelete(id);
    if (!deletedVideo) {
      return NextResponse.json(
        { success: false, message: "Video not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Video deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}