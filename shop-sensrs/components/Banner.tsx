"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useBanners } from "@/context/BannerContext";

export default function Banner() {
  const { banners } = useBanners();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners]);

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="banner">
      <Image
        src={banners[current]}
        alt="banner"
        fill
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}