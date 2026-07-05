"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import FeatureBar from "@/components/FeatureBar";
import ProductCard from "@/components/ProductCard";

type Banner = {
  _id: string;
  imageUrl: string;
};

type Product = {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  description: string;
  hasCustomization?: boolean;
};

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function fetchHeroBanners() {
      try {
        const res = await fetch("/api/banners", { cache: "no-store" });
        const data = await res.json();
        
        if (data.success && data.banners && data.banners.length > 0) {
          setBanners(data.banners);
        }
      } catch (error) {
        console.error("HERO BANNER FETCH SYNC ERROR:", error);
      }
    }

    async function fetchProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("HOME PRODUCTS ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHeroBanners();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const bannerTimer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000);

    return () => clearInterval(bannerTimer);
  }, [banners]);

  const handleScrollToContent = () => {
    const targetSection = document.getElementById("main-catalog-content");
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const currentHeroBg = useMemo(() => {
    if (banners.length > 0 && banners[activeIndex]) {
      return banners[activeIndex].imageUrl;
    }
    return "";
  }, [banners, activeIndex]);

  return (
    <main className="bg-white text-[#0c1c18] font-sans overflow-x-hidden">

      {/* ================= SECTION 1: CINEMATIC HERO SECTION ================= */}
      <section 
        className="relative w-full min-height-[100vh] min-h-screen flex items-center bg-[#01140f] bg-center bg-cover bg-no-repeat px-8 py-16 transition-[background-image] duration-750 ease-in-out"
        style={{
          backgroundImage: currentHeroBg 
            ? `linear-gradient(to right, rgba(1, 20, 15, 0.95) 30%, rgba(1, 20, 15, 0.5) 100%), url('${currentHeroBg}')`
            : `linear-gradient(to right, rgba(1, 20, 15, 0.95) 30%, rgba(1, 20, 15, 0.5) 100%)`
        }}
      >
        <div className="relative max-w-[750px] z-10 pl-4 md:pl-12 text-white">
          <span className="inline-block bg-white/10 text-[#dfc886] text-xs font-bold tracking-[0.15em] px-3 py-1.5 rounded border border-white/10 uppercase mb-6">
            ⚓ INNOVATION UNDER SURFACE
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-[4rem] leading-[1.1] font-normal mb-6 text-white">
            Precision Marine Engineering
          </h1>
          <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-10 max-w-[600px]">
            Pioneering the future of autonomous marine exploration with industrial-grade unmanned surface vehicles and high-fidelity sensory arrays.
          </p>
          <div className="flex flex-wrap gap-5">
            <button 
              type="button" 
              className="bg-[#dfc886] hover:bg-[#d0b36b] text-[#01140f] border-none px-8 py-4 text-base font-semibold rounded-md cursor-pointer transition-colors duration-150 flex items-center gap-2" 
              onClick={() => router.push("/products")}
            >
              Explore Systems <span>➔</span>
            </button>
            <button 
              type="button" 
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-8 py-4 text-base font-semibold rounded-md cursor-pointer transition-colors duration-150" 
              onClick={handleScrollToContent}
            >
              Watch Tech Demo
            </button>
          </div>
        </div>

        {/* Dynamic Carousel Navigation Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                className={`w-2 h-2 rounded-full border-none p-0 cursor-pointer transition-all duration-200 ${
                  activeIndex === dotIndex ? "bg-[#dfc886] scale-125" : "bg-white/40"
                }`}
                onClick={() => setActiveIndex(dotIndex)}
              />
            ))}
          </div>
        )}

        {/* Mouse/Scroll Prompt Indicator */}
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white text-[10px] font-bold tracking-widest uppercase cursor-pointer opacity-80 hover:opacity-100 hover:-translate-y-0.5 transition-all duration-200 z-10" 
          onClick={handleScrollToContent}
        >
          <span>Scroll to Explore</span>
          <div className="w-6 h-9 border-2 border-white rounded-xl relative">
            <div className="w-1 h-2 bg-[#dfc886] rounded-sm absolute top-1.5 left-1/2 -translate-x-1/2 animate-[bounce_1.6s_infinite_ease-in-out]" />
          </div>
        </div>
      </section>

      {/* ================= SCROLLING TARGET CONTENT WRAPPER ================= */}
      <div id="main-catalog-content" className="relative z-10 bg-white">
        
        <FeatureBar />

        {/* ================= SECTION 2: FLAGSHIP USV FEATURE CARD ================= */}
        <section className="max-w-[1300px] mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-block self-start bg-[#fdf3e7] text-[#c07c34] text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded">
              FLAGSHIP TECHNOLOGY
            </span>
            <h2 className="font-serif text-[2.5rem] md:text-[2.8rem] font-normal text-[#00241b] leading-tight m-0">
              BathyCat USV System
            </h2>
            <p className="text-slate-600 text-[1.05rem] leading-relaxed m-0">
              The BathyCat is our flagship Unmanned Surface Vehicle, engineered for high-precision hydrographic surveys in challenging littoral environments. Its modular catamaran hull provides unparalleled stability and payload flexibility.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 mt-4">
              <div className="flex gap-4">
                <span className="text-2xl pt-0.5">🌊</span>
                <div className="flex flex-col gap-1">
                  <h4 className="text-[1.05rem] font-semibold text-slate-900 m-0">Dual-Hull Stability</h4>
                  <p className="text-sm text-slate-500 leading-normal m-0">Optimized geometry for minimal drag and maximum roll resistance.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-2xl pt-0.5">🔋</span>
                <div className="flex flex-col gap-1">
                  <h4 className="text-[1.05rem] font-semibold text-slate-900 m-0">12h Endurance</h4>
                  <p className="text-sm text-slate-500 leading-normal m-0">High-density lithium-ion arrays configured for extended mission profiles.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-2xl pt-0.5">📡</span>
                <div className="flex flex-col gap-1">
                  <h4 className="text-[1.05rem] font-semibold text-slate-900 m-0">Long-Range Link</h4>
                  <p className="text-sm text-slate-500 leading-normal m-0">Encrypted COFDM telemetry architecture for reliable control up to 5km.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-2xl pt-0.5">🏗️</span>
                <div className="flex flex-col gap-1">
                  <h4 className="text-[1.05rem] font-semibold text-slate-900 m-0">Modular Rails</h4>
                  <p className="text-sm text-slate-500 leading-normal m-0">Universal system for ADCPs and high-end sensors.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <img 
              src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1200" 
              alt="BathyCat Flagship Catamaran Model" 
              className="w-full h-auto rounded-2xl object-cover shadow-[0_20px_40px_-15px_rgba(0,36,27,0.15)]"
            />
          </div>
        </section>

        {/* ================= SECTION 3: INDUSTRY BENCHMARKS GRID MATRIX ================= */}
        <section className="bg-[#f8fafb] border-t border-b border-slate-200 px-8 py-24">
          <div className="max-w-[1300px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-[2.5rem] md:text-[2.6rem] font-normal text-[#00241b] mb-2">
                Industry Benchmarks
              </h2>
              <p className="text-slate-500 text-[1.05rem]">
                Our most trusted systems for global marine operations, verified by leading hydrographic agencies.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Benchmark Product 1 */}
              <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-[220px_1fr] overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)]">
                <div className="relative bg-[#01140f] min-h-[250px]">
                  <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500" alt="HydroDrone X" className="w-full h-full object-cover" />
                </div>
                <div className="p-8 flex flex-col gap-3 relative">
                  <span className="absolute top-6 right-6 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded tracking-wide uppercase">
                    TOP RATED
                  </span>
                  <h3 className="font-serif text-2xl text-[#00241b] m-0 pr-16">HydroDrone X</h3>
                  <p className="text-slate-500 text-sm leading-relaxed m-0">
                    Portable, ultra-lightweight autonomous boat designed for high-resolution rapid inland water mapping and environmental monitoring.
                  </p>
                  <div className="text-2xl font-semibold text-[#0c1c18] mt-auto pt-4">₹12,499.00</div>
                  <button 
                    type="button" 
                    className="self-start bg-[#00241b] hover:bg-[#023629] text-white border-none px-5 py-2.5 text-sm font-semibold rounded-md cursor-pointer transition-colors duration-150 mt-2" 
                    onClick={() => router.push("/products")}
                  >
                    Add to Configuration
                  </button>
                </div>
              </div>

              {/* Benchmark Product 2 */}
              <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-[220px_1fr] overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)]">
                <div className="relative bg-[#01140f] min-h-[250px]">
                  <img src="https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=500" alt="SonarArray Pro" className="w-full h-full object-cover" />
                </div>
                <div className="p-8 flex flex-col gap-3 relative">
                  <span className="absolute top-6 right-6 bg-slate-100 text-[#c07c34] text-[10px] font-bold px-2 py-1 rounded tracking-wide uppercase">
                    HIGH ACCURACY
                  </span>
                  <h3 className="font-serif text-2xl text-[#00241b] m-0 pr-24">SonarArray Pro</h3>
                  <p className="text-slate-500 text-sm leading-relaxed m-0">
                    Single-beam dual-frequency transducer with integrated motion compensation layer and 0.01m accuracy threshold for industrial use.
                  </p>
                  <div className="text-2xl font-semibold text-[#0c1c18] mt-auto pt-4">₹4,850.00</div>
                  <button 
                    type="button" 
                    className="self-start bg-white hover:bg-[#f8fafb] text-[#00241b] border border-slate-300 px-5 py-2.5 text-sm font-semibold rounded-md cursor-pointer transition-colors duration-150 mt-2"
                  >
                    View Technical Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: CATALOG PRODUCT PROFILE ENTRIES ================= */}
        <section className="max-w-[1300px] mx-auto px-8 my-24">
          <div className="text-center mb-12">
            <h2 className="font-serif text-[2.5rem] md:text-[2.6rem] font-normal text-[#00241b] mb-2">
              Our Live Catalog Profiles
            </h2>
            <p className="text-slate-500 text-[1.05rem]">
              Deploy operational asset blueprints synchronizing with external cloud compilation nodes.
            </p>
          </div>

          {loading ? (
            <p className="text-center text-slate-400 font-medium">Syncing hardware profiles...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-slate-400 font-medium">No active customized product cards compiled yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
              {products.slice(0, 8).map((product) => (
                <ProductCard
                  key={product._id}
                  _id={product._id}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  category={product.category}
                  hasCustomization={product.hasCustomization}
                />
              ))}
            </div>
          )}
        </section>
      </div>

    </main>
  );
}