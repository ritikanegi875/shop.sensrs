"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBanners } from "@/context/BannerContext";

export default function Banner() {
  const { banners } = useBanners();
  const [current, setCurrent] = useState(0);
  const router = useRouter();

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

  const handleScrollToContent = () => {
    const targetSection = document.getElementById("main-catalog-content");
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    /* ADJUSTED CONTAINER HEIGHT: Scaled progressively from 500px on small mobile up to full height on desktops */
    <section className="relative w-full h-[520px] sm:h-[600px] md:h-[700px] lg:min-h-screen flex items-center bg-[#01140f] overflow-hidden font-sans">
      
      {/* BACKGROUND IMAGE WITH LEFT-TO-RIGHT PREMIUM CINE-GRADIENT OVERLAY */}
      <div className="absolute inset-0 z-0">
        <Image
          src={banners[current]}
          alt="Precision Marine Engineering Hardware Presentation Banner"
          fill
          priority
          className="object-cover"
        />
        {/* Adjusted background gradient to wrap beautifully in portrait stack modes */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#01140f]/90 via-[#01140f]/80 to-[#01140f]/95 md:bg-gradient-to-r md:from-[#01140f]/95 md:via-[#01140f]/70 md:to-transparent" />
      </div>

      {/* LEFT COLUMN: HERO TEXT & INTERACTIVE ACTION SYSTEM ROW */}
      <div className="relative mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 md:px-12 z-10">
        <div className="max-w-[750px] text-white pl-2 md:pl-6">
          
          {/* Badge Anchor Tag */}
          <span className="inline-block bg-white/10 text-[#dfc886] text-[10px] md:text-xs font-bold tracking-[0.15em] px-2.5 py-1 md:px-3 md:py-1.5 rounded border border-white/10 uppercase mb-4 md:mb-6">
            ⚓ INNOVATION UNDER SURFACE
          </span>
          
          {/* Main Display Header (Scaled font sizing responsively) */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-[4rem] leading-[1.15] md:leading-[1.1] font-normal mb-4 md:mb-6 text-white tracking-wide">
            Precision Marine<br />Engineering
          </h1>
          
          {/* Core System Description Paragraph */}
          <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed mb-8 md:mb-10 max-w-[550px]">
            Pioneering the future of autonomous marine exploration with industrial-grade unmanned surface vehicles and high-fidelity sensory arrays.
          </p>
          
          {/* Interactive Button Flow Rows */}
          <div className="flex flex-wrap gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="bg-[#dfc886] hover:bg-[#d0b36b] text-[#01140f] px-5 py-2.5 md:px-7 md:py-3.5 text-xs md:text-sm font-bold rounded-md cursor-pointer transition-colors duration-150 flex items-center gap-2"
            >
              Explore Systems <span>➔</span>
            </button>
            <button
              type="button"
              onClick={handleScrollToContent}
              className="bg-white/5 hover:bg-white/15 text-white border border-white/20 px-5 py-2.5 md:px-7 md:py-3.5 text-xs md:text-sm font-bold rounded-md cursor-pointer transition-colors duration-150"
            >
              Watch Tech Demo
            </button>
          </div>
        </div>
      </div>

      {/* DYNAMIC SCROLL PROMPT ANIMATED INDICATOR ELEMENT (Hidden on ultra small mobile to clean up viewports) */}
      <div 
        onClick={handleScrollToContent}
        className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 text-white/60 text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:text-white transition-colors duration-150 z-10"
      >
        <span className="text-[9px] tracking-[0.2em] font-medium text-slate-400">Scroll to Explore</span>
        <div className="w-5 h-8 border border-white/40 rounded-lg relative flex justify-center">
          <div className="w-0.5 h-1.5 bg-[#dfc886] rounded-full absolute top-1.5 animate-bounce" />
        </div>
      </div>
    </section>
  );
}