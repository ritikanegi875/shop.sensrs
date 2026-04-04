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
    <section className="admin-banners-page">
      <div className="admin-banners-header">
        <h1>Manage Banners</h1>
        <p>Upload banners from device and manage homepage slider images.</p>
      </div>

      <div className="admin-banner-upload-box">
        <input type="file" accept="image/*" onChange={handleFileChange} />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Banner preview"
            className="admin-banner-preview"
          />
        )}

        {message && <p className="auth-message">{message}</p>}

        <button
          type="button"
          className="primary-btn"
          onClick={handleUploadBanner}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Banner"}
        </button>
      </div>

      <div className="admin-banner-grid">
        {banners.length === 0 ? (
          <p className="empty-admin-records">No banners found.</p>
        ) : (
          banners.map((banner) => (
            <div className="admin-banner-card" key={banner._id}>
              <img
                src={banner.imageUrl}
                alt="Banner"
                className="admin-banner-thumb"
              />
              <button
                type="button"
                className="delete-btn"
                onClick={() => handleDeleteBanner(banner._id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}