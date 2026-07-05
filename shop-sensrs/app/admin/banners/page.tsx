"use client";

import { useEffect, useState } from "react";

type Banner = {
  _id: string;
  imageUrl: string;
  publicId?: string;
  isActive: boolean;
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners", {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success) {
        setBanners(data.banners || []);
      }
    } catch (error) {
      console.error("FETCH BANNERS ERROR:", error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setMessage("");

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("");
    }
  };

  const handleUploadBanner = async () => {
    if (!selectedFile) {
      setMessage("Please select an image first.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        setMessage(uploadData.message || "Upload failed");
        setUploading(false);
        return;
      }

      const saveRes = await fetch("/api/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: uploadData.imageUrl,
          publicId: uploadData.publicId,
        }),
      });

      const saveData = await saveRes.json();

      if (!saveData.success) {
        setMessage(saveData.message || "Failed to save banner");
        setUploading(false);
        return;
      }

      setMessage("Banner uploaded successfully");
      setSelectedFile(null);
      setPreviewUrl("");
      await fetchBanners();
    } catch (error) {
      console.error("UPLOAD BANNER ERROR:", error);
      setMessage("Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/banners?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        await fetchBanners();
      }
    } catch (error) {
      console.error("DELETE BANNER ERROR:", error);
    }
  };

  return (
    <section className="bg-slate-50 min-h-screen px-4 py-8 md:px-12 flex justify-center font-sans text-black">
      <div className="w-full max-w-[1200px] flex flex-col gap-8">
        
        {/* ================= PAGE HEADER ================= */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1">Manage Banners</h1>
          <p className="text-sm text-slate-500 font-medium">Upload banners from device and manage homepage slider images.</p>
        </div>

        {/* ================= UPLOAD MANAGER BOX ================= */}
        <div className="border border-slate-200 rounded-[24px] p-6 md:p-8 bg-white flex flex-col gap-5 shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Select Banner Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer cursor-pointer border border-slate-300 rounded-xl p-2"
            />
          </div>

          {/* Upload Local Live Previews */}
          {previewUrl && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Image Preview</span>
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img
                  src={previewUrl}
                  alt="Banner preview blueprint snap"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Operations Message Prompt Line */}
          {message && (
            <p className={`text-xs font-semibold ${message.includes("successfully") ? "text-emerald-600" : "text-rose-500"}`}>
              {message}
            </p>
          )}

          {/* Action Trigger Row */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleUploadBanner}
              disabled={uploading}
              className="rounded-xl bg-[#00241b] hover:bg-[#023629] text-white px-6 py-2.5 text-xs font-bold tracking-wide transition-all duration-150 disabled:bg-slate-200 shadow-sm active:scale-95 uppercase"
            >
              {uploading ? "Uploading..." : "Upload Banner"}
            </button>
          </div>
        </div>

        {/* ================= ACTIVE BANNER DISPLAY IMAGES GRID ================= */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-800 m-0 tracking-tight">Active Homepage Banners</h2>
          
          {banners.length === 0 ? (
            <p className="text-center text-slate-400 font-medium py-16 bg-white rounded-2xl border border-slate-200">
              No banners found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner) => (
                <div 
                  className="group border border-slate-200 rounded-[24px] p-4 bg-white flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-200" 
                  key={banner._id}
                >
                  <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    <img
                      src={banner.imageUrl}
                      alt="Active hardware presentation banner configuration line"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex justify-end pt-1 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner._id)}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors duration-150 active:scale-95"
                    >
                      Delete Banner
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}