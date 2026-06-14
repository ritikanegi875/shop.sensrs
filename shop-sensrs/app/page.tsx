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
  
  // State variables tracking slider sets and indexing values
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

  // FIXED: Auto-sliding background interval rules loop forward every 3000ms
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

  // Safely fallback to high-quality placeholder image if database contains no records
  const currentHeroBg = useMemo(() => {
    if (banners.length > 0 && banners[activeIndex]) {
      return banners[activeIndex].imageUrl;
    }
    return "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=2000";
  }, [banners, activeIndex]);

  return (
    <main className="premium-home-container">
      {/* Integrated Single File CSS Styling Rules Blueprint */}
      <style dangerouslySetInnerHTML={{__html: `
        .premium-home-container { background: #ffffff; color: #0c1c18; font-family: system-ui, -apple-system, sans-serif; overflow-x: hidden; }
        
        /* 1. Full-Height Cinematic Hero Layout Section */
        .cinematic-hero { 
          position: relative; 
          width: 100%; 
          min-height: 100vh; 
          display: flex; 
          align-items: center; 
          background-color: #01140f;
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          padding: 4rem 2rem; 
          box-sizing: border-box; 
          transition: background-image 0.8s ease-in-out; /* FIXED: Cross-fades sliding changes cleanly */
        }
        .hero-text-content { position: relative; max-width: 750px; z-index: 2; padding-left: 3rem; color: #ffffff; }
        .hero-badge-tag { display: inline-block; background: rgba(226, 242, 237, 0.15); color: #dfc886; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.15em; padding: 0.4rem 0.8rem; border-radius: 4px; text-transform: uppercase; margin-bottom: 1.5rem; border: 1px solid rgba(226,242,237,0.1); }
        .hero-text-content h1 { font-family: Georgia, serif; font-size: 4rem; line-height: 1.1; font-weight: 400; margin: 0 0 1.5rem 0; color: #ffffff; }
        .hero-text-content p { font-size: 1.15rem; line-height: 1.6; color: #cbd5e1; margin: 0 0 2.5rem 0; max-width: 600px; }
        .hero-actions-row { display: flex; gap: 1.25rem; }
        .btn-primary-gold { background: #dfc886; color: #01140f; border: none; padding: 1rem 2rem; font-size: 1rem; font-weight: 600; border-radius: 6px; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; gap: 0.5rem; }
        .btn-primary-gold:hover { background: #d0b36b; }
        .btn-secondary-outline { background: rgba(255,255,255,0.08); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); padding: 1rem 2rem; font-size: 1rem; font-weight: 600; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
        .btn-secondary-outline:hover { background: rgba(255,255,255,0.15); }

        /* Carousel Navigation Dots */
        .banner-carousel-dots { position: absolute; bottom: 5rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.5rem; z-index: 3; }
        .carousel-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, 0.4); border: none; cursor: pointer; padding: 0; transition: background 0.2s, transform 0.2s; }
        .carousel-dot.active { background: #dfc886; transform: scale(1.25); }

        .scroll-prompt-wrapper {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s, transform 0.2s;
          z-index: 3;
        }
        .scroll-prompt-wrapper:hover { opacity: 1; transform: translate(-50%, -3px); }
        .mouse-wheel-track { width: 24px; height: 38px; border: 2px solid #ffffff; border-radius: 12px; position: relative; }
        .mouse-wheel-dot { width: 4px; height: 8px; background-color: #dfc886; position: absolute; top: 6px; left: 50%; transform: translateX(-50%); border-radius: 2px; animation: wheel-slide 1.6s infinite ease-in-out; }

        @keyframes wheel-slide {
          0% { opacity: 0; top: 6px; }
          20% { opacity: 1; }
          80% { opacity: 1; top: 18px; }
          100% { opacity: 0; top: 18px; }
        }

        .scrolled-content-wrapper { position: relative; z-index: 2; background: #ffffff; }
        .flagship-showcase-section { max-width: 1300px; margin: 0 auto; padding: 6rem 2rem; display: grid; grid-template-columns: 1.1fr 1fr; gap: 4rem; align-items: center; }
        .flagship-info-pane { display: flex; flex-direction: column; gap: 1.5rem; }
        .flagship-tag { display: inline-block; align-self: flex-start; background: #fdf3e7; color: #c07c34; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.35rem 0.75rem; border-radius: 4px; }
        .flagship-info-pane h2 { font-family: Georgia, serif; font-size: 2.8rem; font-weight: 400; color: #00241b; margin: 0; }
        .flagship-info-pane p { color: #475569; font-size: 1.05rem; line-height: 1.6; margin: 0; }
        .flagship-metrics-subgrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem 1.5rem; margin-top: 1rem; }
        .flagship-metric-box { display: flex; gap: 1rem; }
        .metric-icon-frame { font-size: 1.5rem; padding-top: 0.2rem; }
        .metric-text-wrapper h4 { font-size: 1.05rem; font-weight: 600; color: #0f172a; margin: 0 0 0.25rem 0; }
        .metric-text-wrapper p { font-size: 0.875rem; color: #64748b; line-height: 1.4; margin: 0; }
        .flagship-render-wrapper img { width: 100%; height: auto; border-radius: 16px; object-fit: cover; box-shadow: 0 20px 40px -15px rgba(0,36,27,0.15); }

        .benchmarks-section { background: #f8fafb; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 6rem 2rem; }
        .benchmarks-inner { max-width: 1300px; margin: 0 auto; }
        .section-center-head { text-align: center; margin-bottom: 4rem; }
        .section-center-head h2 { font-family: Georgia, serif; font-size: 2.6rem; font-weight: 400; color: #00241b; margin: 0 0 0.5rem 0; }
        .section-center-head p { color: #64748b; font-size: 1.05rem; margin: 0; }
        .replica-benchmarks-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
        .benchmark-mock-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; display: grid; grid-template-columns: 220px 1fr; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .mock-card-image { position: relative; background: #01140f; min-height: 250px; }
        .mock-card-image img { width: 100%; height: 100%; object-fit: cover; }
        .mock-card-details { padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem; position: relative; }
        .mock-badge { position: absolute; top: 1.5rem; right: 1.5rem; background: #f1f5f9; color: #475569; font-size: 0.65rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 4px; letter-spacing: 0.05em; text-transform: uppercase; }
        .mock-card-details h3 { font-family: Georgia, serif; font-size: 1.4rem; color: #00241b; margin: 0; }
        .mock-card-details p { color: #64748b; font-size: 0.9rem; line-height: 1.5; margin: 0; }
        .mock-price-tag { font-size: 1.5rem; font-weight: 600; color: #0c1c18; margin-top: auto; }
        .btn-mock-action { align-self: flex-start; background: #00241b; color: white; border: none; padding: 0.65rem 1.25rem; font-size: 0.85rem; font-weight: 600; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
        .btn-mock-action:hover { background: #023629; }
        .btn-mock-outline { align-self: flex-start; background: #ffffff; color: #00241b; border: 1px solid #cbd5e1; padding: 0.65rem 1.25rem; font-size: 0.85rem; font-weight: 600; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
        .btn-mock-outline:hover { background: #f8fafb; }

        .catalog-showcase-section { max-width: 1300px; margin: 6rem auto; padding: 0 2rem; }
        .replica-products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(285px, 1fr)); gap: 1.5rem; margin-top: 3rem; }
      `}} />

      {/* ================= SECTION 1: CINEMATIC REPLICA HERO WITH AUTOMATIC BACKGROUND INTERVALS ================= */}
      <section 
        className="cinematic-hero"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(1, 20, 15, 0.9) 30%, rgba(1, 20, 15, 0.4) 100%), url('${currentHeroBg}')`
        }}
      >
        <div className="hero-text-content">
          <span className="hero-badge-tag">⚓ INNOVATION UNDER SURFACE</span>
          <h1>Precision Marine Engineering</h1>
          <p>
            Pioneering the future of autonomous marine exploration with industrial-grade unmanned surface vehicles and high-fidelity sensory arrays.
          </p>
          <div className="hero-actions-row">
            <button type="button" className="btn-primary-gold" onClick={() => router.push("/products")}>
              Explore Systems <span>➔</span>
            </button>
            <button type="button" className="btn-secondary-outline" onClick={handleScrollToContent}>
              Watch Tech Demo
            </button>
          </div>
        </div>

        {/* Dynamic Pagination Carousel Dots Indicators */}
        {banners.length > 1 && (
          <div className="banner-carousel-dots">
            {banners.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                className={`carousel-dot ${activeIndex === dotIndex ? "active" : ""}`}
                onClick={() => setActiveIndex(dotIndex)}
              />
            ))}
          </div>
        )}

        <div className="scroll-prompt-wrapper" onClick={handleScrollToContent}>
          <span>Scroll to Explore</span>
          <div className="mouse-wheel-track">
            <div className="mouse-wheel-dot" />
          </div>
        </div>
      </section>

      {/* ================= SCROLLING TARGET COMPONENT WRAPPER ================= */}
      <div id="main-catalog-content" className="scrolled-content-wrapper">
        
        <FeatureBar />

        {/* ================= SECTION 2: FLAGSHIP USV FEATURE CARD ================= */}
        <section className="flagship-showcase-section">
          <div className="flagship-info-pane">
            <span className="flagship-tag">FLAGSHIP TECHNOLOGY</span>
            <h2>BathyCat USV System</h2>
            <p>
              The BathyCat is our flagship Unmanned Surface Vehicle, engineered for high-precision hydrographic surveys in challenging littoral environments. Its modular catamaran hull provides unparalleled stability and payload flexibility.
            </p>
            
            <div className="flagship-metrics-subgrid">
              <div className="flagship-metric-box">
                <span className="metric-icon-frame">🌊</span>
                <div className="metric-text-wrapper">
                  <h4>Dual-Hull Stability</h4>
                  <p>Optimized geometry for minimal drag and maximum roll resistance.</p>
                </div>
              </div>

              <div className="flagship-metric-box">
                <span className="metric-icon-frame">🔋</span>
                <div className="metric-text-wrapper">
                  <h4>12h Endurance</h4>
                  <p>High-density lithium-ion arrays configured for extended mission profiles.</p>
                </div>
              </div>

              <div className="flagship-metric-box">
                <span className="metric-icon-frame">📡</span>
                <div className="metric-text-wrapper">
                  <h4>Long-Range Link</h4>
                  <p>Encrypted COFDM telemetry architecture for reliable control up to 5km.</p>
                </div>
              </div>

              <div className="flagship-metric-box">
                <span className="metric-icon-frame">🏗️</span>
                <div className="metric-text-wrapper">
                  <h4>Modular Rails</h4>
                  <p>Universal system for ADCPs and high-end sensors.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flagship-render-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1200" 
              alt="BathyCat Flagship Catamaran Model" 
            />
          </div>
        </section>

        {/* ================= SECTION 3: INDUSTRY BENCHMARKS GRID MATRIX ================= */}
        <section className="benchmarks-section">
          <div className="benchmarks-inner">
            <div className="section-center-head">
              <h2>Industry Benchmarks</h2>
              <p>Our most trusted systems for global marine operations, verified by leading hydrographic agencies.</p>
            </div>

            <div className="replica-benchmarks-grid">
              <div className="benchmark-mock-card">
                <div className="mock-card-image">
                  <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500" alt="HydroDrone X" />
                </div>
                <div className="mock-card-details">
                  <span className="mock-badge">TOP RATED</span>
                  <h3>HydroDrone X</h3>
                  <p>Portable, ultra-lightweight autonomous boat designed for high-resolution rapid inland water mapping and environmental monitoring.</p>
                  <div className="mock-price-tag">₹12,499.00</div>
                  <button type="button" className="btn-mock-action" onClick={() => router.push("/products")}>
                    Add to Configuration
                  </button>
                </div>
              </div>

              <div className="benchmark-mock-card">
                <div className="mock-card-image">
                  <img src="https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=500" alt="SonarArray Pro" />
                </div>
                <div className="mock-card-details">
                  <span className="mock-badge" style={{ color: "#c07c34" }}>HIGH ACCURACY</span>
                  <h3>SonarArray Pro</h3>
                  <p>Single-beam dual-frequency transducer with integrated motion compensation layer and 0.01m accuracy threshold for industrial use.</p>
                  <div className="mock-price-tag">₹4,850.00</div>
                  <button type="button" className="btn-mock-outline">
                    View Technical Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: CATALOG PRODUCT PROFILE ENTRIES ================= */}
        <section className="catalog-showcase-section">
          <div className="section-center-head" style={{ marginBottom: "2rem" }}>
            <h2>Our Live Catalog Profiles</h2>
            <p>Deploy operational asset blueprints synchronizing with external cloud compilation nodes.</p>
          </div>

          {loading ? (
            <p className="empty-admin-records" style={{ textAlign: "center" }}>Syncing hardware profiles...</p>
          ) : products.length === 0 ? (
            <p className="empty-admin-records" style={{ textAlign: "center" }}>No active customized product cards compiled yet.</p>
          ) : (
            <div className="replica-products-grid">
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