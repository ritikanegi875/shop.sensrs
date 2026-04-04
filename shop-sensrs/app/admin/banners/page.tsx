"use client";

import { useState } from "react";
import { useBanners } from "@/context/BannerContext";

export default function AdminBannersPage() {
  const { banners, addBanner, removeBanner, replaceBanner } = useBanners();
  const [newBanner, setNewBanner] = useState("");

  return (
    <section className="admin-banners-page">
      <div className="admin-banners-header">
        <div>
          <h1>Manage Banners</h1>
          <p>Add, replace, or remove homepage banners.</p>
        </div>
      </div>

      <div className="admin-banner-add-box">
        <input
          type="text"
          placeholder="/images/new-banner.jpg"
          value={newBanner}
          onChange={(e) => setNewBanner(e.target.value)}
        />
        <button
          onClick={() => {
            if (!newBanner.trim()) return;
            addBanner(newBanner.trim());
            setNewBanner("");
          }}
        >
          Add Banner
        </button>
      </div>

      <div className="admin-banner-list">
        {banners.map((banner, index) => (
          <div className="admin-banner-card" key={index}>
            <p>{banner}</p>

            <div className="admin-banner-actions">
              <button
                className="edit-btn"
                onClick={() => {
                  const updated = prompt("Enter new banner path", banner);
                  if (updated && updated.trim()) {
                    replaceBanner(index, updated.trim());
                  }
                }}
              >
                Replace
              </button>

              <button
                className="delete-btn"
                onClick={() => removeBanner(index)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}