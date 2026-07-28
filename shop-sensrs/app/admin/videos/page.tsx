"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plus,
  Trash2,
  Video as VideoIcon,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Calendar,
  Image as ImageIcon,
  BarChart3,
  Download,
  ExternalLink,
} from "lucide-react";

type VideoItem = {
  _id: string;
  title: string;
  tag: string;
  desc: string;
  videoUrl: string;
  createdAt?: string;
};

export default function AdminVideosPage() {
  const pathname = usePathname();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("Useful newsletter");
  const [desc, setDesc] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setVideos(data.videos || []);
      }
    } catch (err) {
      console.error("FETCH VIDEOS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !videoUrl) {
      return alert("Title and Video URL are required!");
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tag, desc, videoUrl }),
      });
      const data = await res.json();

      if (data.success) {
        setTitle("");
        setDesc("");
        setVideoUrl("");
        fetchVideos();
      } else {
        alert(data.message || "Failed to add video");
      }
    } catch (err) {
      alert("Error saving video");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to remove this video?")) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setVideos((prev) => prev.filter((v) => v._id !== id));
      } else {
        alert(data.message || "Failed to delete video");
      }
    } catch (err) {
      alert("Error deleting video");
    } finally {
      setDeletingId(null);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: ShoppingBag },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Appointments", href: "/admin/appointments", icon: Calendar },
    { label: "Banners", href: "/admin/banners", icon: ImageIcon },
    { label: "Videos", href: "/admin/videos", icon: VideoIcon },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Export Records", href: "/api/export", icon: Download, isExternal: true },
  ];

  return (
    <div className="flex bg-[#f8fafc] min-h-screen font-sans w-full">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-2 shrink-0 min-h-screen">
        <div className="text-xl font-bold px-3 mb-6 text-slate-900">
          Shop.SEnSRS
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto w-full max-w-full">
        <div className="flex justify-between items-start mb-8 w-full">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Showcase Videos</h1>
            <p className="text-sm text-slate-500 mt-1">
              Add, update, or remove MP4 video links displayed in the homepage mobile stories slider.
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
          >
            Preview Homepage <ExternalLink size={14} />
          </Link>
        </div>

        {/* WORKSPACE FLEX WRAPPER */}
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          
          {/* ADD VIDEO FORM CARD */}
          <div className="w-full lg:w-[380px] bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm shrink-0">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-emerald-600" /> Add Homepage Video
            </h2>

            <form onSubmit={handleAddVideo} className="flex flex-col gap-4 w-full">
              <div className="w-full">
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Video Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. USV Autonomous Navigation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="w-full">
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Tag / Subheader
                </label>
                <input
                  type="text"
                  placeholder="e.g. FIELD DEPLOYMENT"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="w-full">
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  MP4 Video Link (Direct URL)
                </label>
                <input
                  type="url"
                  placeholder="https://domain.com/video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="w-full">
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of the video stream..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#00241b] hover:bg-[#023629] text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer shadow mt-2 text-sm"
              >
                {submitting ? "Saving..." : "Add to Homepage"}
              </button>
            </form>
          </div>

          {/* ACTIVE VIDEOS GRID CONTAINER */}
          <div className="flex-1 w-full flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-900">
              Current Active Videos ({videos.length})
            </h2>

            {loading ? (
              <p className="text-sm text-slate-400 py-8">Loading video records...</p>
            ) : videos.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-sm w-full">
                No custom videos uploaded yet. Add a link above to display on the homepage slider.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full">
                {videos.map((vid) => (
                  <div
                    key={vid._id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col justify-between w-full"
                  >
                    {/* Video Preview Frame */}
                    <div className="relative aspect-[9/16] w-full bg-slate-950 rounded-xl overflow-hidden mb-3">
                      <video
                        src={vid.videoUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        autoPlay
                        playsInline
                      />
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-[9px] font-bold text-emerald-400 uppercase">
                        {vid.tag}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm truncate">
                        {vid.title}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {vid.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={deletingId === vid._id}
                      onClick={() => handleDeleteVideo(vid._id)}
                      className="mt-3 w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} /> Remove Video
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}