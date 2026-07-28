"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { 
  Play, ChevronLeft, ChevronRight, ArrowUpRight, 
  MapPin, Send, Mail, Phone, User, MessageSquare, X 
} from "lucide-react";

type Banner = {
  _id: string;
  imageUrl: string;
  category?: string;
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

type VideoItem = {
  _id?: string;
  title: string;
  tag: string;
  desc: string;
  duration?: string;
  thumb?: string;
  videoUrl: string;
};

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1` : null;
}

function getYouTubeThumbnail(url: string): string {
  const videoId = getYouTubeId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return "";
}

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [bannerTwoImage, setBannerTwoImage] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState(0);

  const [videoList, setVideoList] = useState<VideoItem[]>([]);
  const [videoIndex, setVideoIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const bannerRes = await fetch("/api/banners", { cache: "no-store" });
        const bannerData = await bannerRes.json();
        if (bannerData.success && bannerData.banners && bannerData.banners.length > 0) {
          const allBanners: Banner[] = bannerData.banners;
          
          const heroes = allBanners.filter((b) => !b.category || b.category === "hero");
          const bannerTwoItem = allBanners.find((b) => b.category === "banner-two");

          if (heroes.length > 0) {
            setHeroBanners(heroes);
          }
          if (bannerTwoItem && bannerTwoItem.imageUrl) {
            setBannerTwoImage(bannerTwoItem.imageUrl);
          }
        }

        const prodRes = await fetch("/api/products", { cache: "no-store" });
        const prodData = await prodRes.json();
        if (prodData.success) {
          setProducts(prodData.products || []);
        }

        const vidRes = await fetch("/api/videos", { cache: "no-store" });
        const vidData = await vidRes.json();
        if (vidData.success && Array.isArray(vidData.videos) && vidData.videos.length > 0) {
          const dbVideos = vidData.videos.map((v: any) => ({
            _id: v._id,
            title: v.title || "Featured Video",
            tag: v.tag || "PRODUCT DEMO",
            desc: v.desc || "Explore our latest technology in action.",
            duration: v.duration || "03:15",
            thumb: getYouTubeThumbnail(v.videoUrl || v.url),
            videoUrl: v.videoUrl || v.url || "",
          })).filter((v: VideoItem) => Boolean(v.videoUrl));

          setVideoList(dbVideos);
        }
      } catch (error) {
        console.error("DATA FETCH ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const bannerTimer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % heroBanners.length);
    }, 3000);
    return () => clearInterval(bannerTimer);
  }, [heroBanners]);

  useEffect(() => {
    if (isPaused || videoList.length <= 1) return;

    const autoSlideTimer = setInterval(() => {
      setVideoIndex((prev) => (prev + 1) % videoList.length);
    }, 4500);

    return () => clearInterval(autoSlideTimer);
  }, [isPaused, videoList]);

  const handlePrevVideo = () => {
    if (videoList.length === 0) return;
    setVideoIndex((prev) => (prev - 1 + videoList.length) % videoList.length);
  };

  const handleNextVideo = () => {
    if (videoList.length === 0) return;
    setVideoIndex((prev) => (prev + 1) % videoList.length);
  };

  const visibleVideos = useMemo(() => {
    const total = videoList.length;
    if (total === 0) return [];

    const list = [];
    for (let i = 0; i < Math.min(3, total > 0 ? 3 : 0); i++) {
      const targetIdx = (videoIndex + i) % total;
      list.push({
        ...videoList[targetIdx],
        originalIndex: targetIdx,
        isCenter: i === 1 || total === 1, // Make it center if it's the middle one OR the only one
      });
    }
    return list;
  }, [videoIndex, videoList]);

  const handleScrollToContent = () => {
    const targetSection = document.getElementById("video-showcase-section") || document.getElementById("live-catalog-section");
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const currentHeroBg = useMemo(() => {
    if (heroBanners.length > 0 && heroBanners[activeIndex]) {
      return heroBanners[activeIndex].imageUrl;
    }
    return "";
  }, [heroBanners, activeIndex]);

  return (
    <main className="w-full bg-[#fafbf9] text-[#0c1c18] font-sans antialiased overflow-x-hidden selection:bg-[#00241b] selection:text-white">
      
      {/* ================= SECTION 1: HERO SECTION ================= */}
      <section className="relative w-full min-h-[90vh] lg:min-h-screen flex items-center px-6 sm:px-12 lg:px-20 py-16 bg-[#01140f] overflow-hidden transition-all duration-750">
        
        {/* Background Image fixed for mobile responsiveness */}
        {currentHeroBg && (
          <img 
            src={currentHeroBg} 
            alt="Hero Background" 
            className="absolute inset-0 w-full h-full object-cover object-[75%_center] md:object-center z-0 opacity-90"
          />
        )}
        
        {/* Responsive Gradient Overlay (Allows image to show through nicely on mobile) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b md:bg-gradient-to-r from-[#01140f]/95 via-[#01140f]/80 md:via-[#01140f]/60 to-transparent" />

        <div className="relative z-10 w-full max-w-4xl mx-auto lg:mx-0 lg:pl-6 text-left pt-12 md:pt-0">
          <span className="inline-flex items-center gap-1.5 bg-white/10 text-[#dfc886] text-[10px] md:text-xs font-bold tracking-[0.15em] px-3.5 py-1.5 rounded border border-white/10 uppercase mb-6 backdrop-blur-md">
            <span>⚓</span> INNOVATION UNDER SURFACE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] text-white font-normal leading-[1.1] mb-6 drop-shadow-md">
            Precision Marine Engineering
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-xl leading-relaxed mb-10 drop-shadow">
            Pioneering the future of autonomous marine exploration with industrial-grade unmanned surface vehicles and high-fidelity sensory arrays.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              type="button" 
              className="bg-[#dfc886] hover:bg-[#d0b36b] text-[#01140f] px-6 md:px-7 py-3 md:py-3.5 text-sm md:text-base font-semibold rounded cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              onClick={() => router.push("/products")}
            >
              Explore Systems <span>➔</span>
            </button>
            <button 
              type="button" 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 md:px-7 py-3 md:py-3.5 text-sm md:text-base font-semibold rounded cursor-pointer transition-all duration-200 backdrop-blur-sm"
              onClick={handleScrollToContent}
            >
              Watch Tech Demo
            </button>
          </div>
        </div>

        {heroBanners.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {heroBanners.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === dotIndex ? "bg-[#dfc886] w-6" : "bg-white/40"}`}
                onClick={() => setActiveIndex(dotIndex)}
              />
            ))}
          </div>
        )}

        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 hover:text-white transition-all cursor-pointer text-[10px] font-bold tracking-widest uppercase z-20"
          onClick={handleScrollToContent}
        >
          <span>Scroll to Explore</span>
          <div className="w-5 h-8 border-2 border-white/80 rounded-full relative">
            <div className="w-1 h-2 bg-[#dfc886] rounded-full absolute left-1/2 -translate-x-1/2 top-1.5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: HORIZONTAL WIDESCREEN YOUTUBE VIDEO SLIDER ================= */}
      {videoList.length > 0 && (
        <section 
          id="video-showcase-section" 
          className="w-full bg-[#fbfdf9] pt-16 pb-22 px-6 sm:px-8 lg:px-12 relative border-t border-slate-200/80"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="max-w-5xl mx-auto">
            
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-[#c07c34] text-xs font-bold tracking-[0.2em] uppercase mb-1.5 block">
                VIDEOS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#00241b] mb-2">
                Watch our products in action
              </h2>
              <div className="w-12 h-[2px] bg-[#c07c34] mx-auto mb-3" />
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Explore product demos, field operations and real-world deployments.
              </p>
            </div>

            <div className="relative px-2 sm:px-6 pt-2 pb-4">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch justify-center">
                {visibleVideos.map((video, idx) => {
                  const isCenter = video.isCenter;
                  const thumbImg = video.thumb;

                  return (
                    <div 
                      key={`${video.originalIndex}-${idx}`}
                      onClick={() => setPlayingVideo(video)}
                      className={`bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col justify-between ${
                        isCenter 
                          ? "md:-translate-y-2.5 shadow-lg ring-1 ring-slate-200 z-20" 
                          : "z-10"
                      }`}
                    >
                      <div>
                        <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                          {thumbImg && (
                            <img 
                              src={thumbImg} 
                              alt={video.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          )}
                          
                          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                            {isCenter ? (
                              <div className="w-11 h-11 rounded-full bg-white text-[#00241b] flex items-center justify-center pl-0.5 shadow-lg group-hover:scale-110 transition-transform">
                                <Play size={18} fill="#00241b" className="text-[#00241b]" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full border-2 border-white/80 bg-black/20 backdrop-blur-xs text-white flex items-center justify-center pl-0.5 shadow-md group-hover:scale-110 transition-transform">
                                <Play size={15} fill="white" className="text-white" />
                              </div>
                            )}
                          </div>

                          <span className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                            {video.duration || "02:35"}
                          </span>
                        </div>

                        <div className="p-5">
                          <span className="inline-block bg-[#fdf3e7] text-[#c07c34] text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded mb-2">
                            {video.tag}
                          </span>
                          <h3 className="font-serif text-lg text-[#00241b] font-normal mb-1.5 leading-snug">
                            {video.title}
                          </h3>
                          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                            {video.desc}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-0 flex justify-end">
                        <div className="w-7 h-7 rounded-lg border border-amber-200/80 bg-[#fdf3e7]/80 flex items-center justify-center text-[#c07c34] group-hover:bg-[#00241b] group-hover:text-white group-hover:border-[#00241b] transition-all">
                          <ArrowUpRight size={14} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {videoList.length > 1 && (
                <>
                  <button 
                    type="button"
                    onClick={handlePrevVideo}
                    className="flex absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-700 shadow-md hover:bg-[#00241b] hover:text-white transition-all cursor-pointer z-30"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button 
                    type="button"
                    onClick={handleNextVideo}
                    className="flex absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-700 shadow-md hover:bg-[#00241b] hover:text-white transition-all cursor-pointer z-30"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {videoList.length > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                {videoList.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setVideoIndex(dotIdx)}
                    className={`transition-all rounded-full cursor-pointer ${
                      videoIndex === dotIdx ? "w-4 h-2 bg-[#00241b]" : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            )}

          </div>
        </section>
      )}

      {/* ================= YOUTUBE VIDEO PLAYER MODAL ================= */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between p-4 bg-slate-950 text-white border-b border-slate-800">
              <span className="font-serif text-lg text-amber-400 font-medium">{playingVideo.title}</span>
              <button 
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="relative aspect-video w-full bg-black">
              {getYouTubeEmbedUrl(playingVideo.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(playingVideo.videoUrl)!}
                  title={playingVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  Invalid Video Link
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3: LIVE STATISTICS DASHBOARD ================= */}
      <section className="w-full bg-[#f4f6f1] py-20 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#00241b] font-normal mb-3">
              Live Statistics Dashboard
            </h2>
            <div className="w-12 h-[2px] bg-[#c07c34] mx-auto mb-4" />
            <p className="text-slate-500 text-sm sm:text-base">
              Real-time insights that reflect our commitment to innovation, precision, and customer success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center flex flex-col items-center justify-between shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#00241b] flex items-center justify-center mb-4">
                <span className="text-xl">📦</span>
              </div>
              <div className="font-serif text-3xl lg:text-4xl font-normal text-[#00241b] mb-1">
                15<span className="text-[#c07c34]">+</span>
              </div>
              <div className="w-8 h-[2px] bg-[#c07c34] mb-3" />
              <h4 className="font-semibold text-slate-800 text-sm mb-1">Products Deployed</h4>
              <p className="text-slate-500 text-xs leading-relaxed">High-performance USV models in the field</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center flex flex-col items-center justify-between shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#00241b] flex items-center justify-center mb-4">
                <span className="text-xl">👥</span>
              </div>
              <div className="font-serif text-3xl lg:text-4xl font-normal text-[#00241b] mb-1">
                200<span className="text-[#c07c34]">+</span>
              </div>
              <div className="w-8 h-[2px] bg-[#c07c34] mb-3" />
              <h4 className="font-semibold text-slate-800 text-sm mb-1">Happy Clients</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Organizations that trust our technology</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center flex flex-col items-center justify-between shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#00241b] flex items-center justify-center mb-4">
                <span className="text-xl">🚢</span>
              </div>
              <div className="font-serif text-3xl lg:text-4xl font-normal text-[#00241b] mb-1">
                50K<span className="text-[#c07c34]">+</span>
              </div>
              <div className="w-8 h-[2px] bg-[#c07c34] mb-3" />
              <h4 className="font-semibold text-slate-800 text-sm mb-1">Successful Missions</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Surveys completed across rivers, lakes & oceans</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center flex flex-col items-center justify-between shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#00241b] flex items-center justify-center mb-4">
                <span className="text-xl">🎯</span>
              </div>
              <div className="font-serif text-3xl lg:text-4xl font-normal text-[#00241b] mb-1">
                99.8<span className="text-[#c07c34]">%</span>
              </div>
              <div className="w-8 h-[2px] bg-[#c07c34] mb-3" />
              <h4 className="font-semibold text-slate-800 text-sm mb-1">Data Accuracy</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Precision you can rely on, every single time</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center flex flex-col items-center justify-between shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#00241b] flex items-center justify-center mb-4">
                <span className="text-xl">🕒</span>
              </div>
              <div className="font-serif text-3xl lg:text-4xl font-normal text-[#00241b] mb-1">
                24<span className="text-[#c07c34]">/7</span>
              </div>
              <div className="w-8 h-[2px] bg-[#c07c34] mb-3" />
              <h4 className="font-semibold text-slate-800 text-sm mb-1">Live Support</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Our team is always here to help you</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: OUR LIVE CATALOG PROFILES ================= */}
      <section id="live-catalog-section" className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#00241b] mb-3">
            Our Live Catalog Profiles
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            Deploy operational asset blueprints synchronizing with external cloud compilation nodes.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-medium">Syncing hardware profiles...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium">No active customized product cards compiled yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

      {/* ================= BANNER TWO SECTION (DYNAMIC ADMIN IMAGE ONLY) ================= */}
      {bannerTwoImage && (
        <section className="w-full bg-[#fafbf9] pb-20 border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <img 
              src={bannerTwoImage} 
              alt="Product Features Showcase" 
              className="w-full h-auto object-contain rounded-2xl shadow-sm border border-slate-200/60"
            />
          </div>
        </section>
      )}

      {/* ================= SECTION 6: OUR MISSION WORKFLOW ================= */}
      <section className="w-full bg-[#f4f6f1] py-20 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#c07c34] text-xs font-bold tracking-widest uppercase mb-2 block">HOW IT WORKS</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#00241b] font-normal mb-3">
              Our Mission Workflow
            </h2>
            <div className="w-12 h-[2px] bg-[#c07c34] mx-auto mb-4" />
            <p className="text-slate-500 text-sm sm:text-base">
              From planning to insights - our intelligent workflow ensures seamless and accurate survey missions.
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-between max-w-5xl mx-auto mb-12 relative px-10">
            <div className="absolute top-1/2 left-16 right-16 h-[2px] bg-slate-300 border-dashed border-t border-slate-400 -translate-y-1/2 z-0" />
            {["01", "02", "03", "04", "05"].map((num, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center bg-[#f4f6f1] px-2">
                <span className="text-xs font-bold text-slate-700 mb-2">{num}</span>
                <div className="w-8 h-8 rounded-full bg-[#00241b] text-white flex items-center justify-center text-xs font-bold shadow">
                  ✓
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <div className="w-full h-32 rounded-xl bg-slate-900 overflow-hidden mb-4">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400" alt="Plan Mission" className="w-full h-full object-cover" />
              </div>
              <h4 className="font-serif font-semibold text-slate-900 text-base mb-2 text-center">Plan Mission</h4>
              <p className="text-slate-500 text-xs text-center leading-relaxed">
                Plan your survey area, define waypoints and mission parameters using our intuitive planning tools.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <div className="w-full h-32 rounded-xl bg-slate-900 overflow-hidden mb-4">
                <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=400" alt="Deploy USV" className="w-full h-full object-cover" />
              </div>
              <h4 className="font-serif font-semibold text-slate-900 text-base mb-2 text-center">Deploy USV</h4>
              <p className="text-slate-500 text-xs text-center leading-relaxed">
                Easily deploy the USV into the water. It's built for stability, endurance and all-weather performance.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <div className="w-full h-32 rounded-xl bg-slate-900 overflow-hidden mb-4">
                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400" alt="AI Navigation" className="w-full h-full object-cover" />
              </div>
              <h4 className="font-serif font-semibold text-slate-900 text-base mb-2 text-center">AI Navigation</h4>
              <p className="text-slate-500 text-xs text-center leading-relaxed">
                Advanced AI algorithms and sensors navigate autonomously while avoiding obstacles and adapting to conditions.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <div className="w-full h-32 rounded-xl bg-slate-900 overflow-hidden mb-4">
                <img src="https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=400" alt="Collect Data" className="w-full h-full object-cover" />
              </div>
              <h4 className="font-serif font-semibold text-slate-900 text-base mb-2 text-center">Collect Data</h4>
              <p className="text-slate-500 text-xs text-center leading-relaxed">
                High-precision sensors collect real-time data including bathymetry, imagery and environmental parameters.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <div className="w-full h-32 rounded-xl bg-slate-900 overflow-hidden mb-4">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400" alt="Generate Insights" className="w-full h-full object-cover" />
              </div>
              <h4 className="font-serif font-semibold text-slate-900 text-base mb-2 text-center">Generate Insights</h4>
              <p className="text-slate-500 text-xs text-center leading-relaxed">
                Securely process and visualize your data. Generate actionable insights and export custom reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 7: CLIENT REVIEWS ================= */}
      <section className="w-full bg-[#fafbf9] py-20 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#c07c34] text-xs font-bold tracking-widest uppercase mb-2 block">CLIENT REVIEWS</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#00241b] font-normal mb-3">
              What our Clients say!
            </h2>
            <div className="w-12 h-[2px] bg-[#c07c34] mx-auto mb-4" />
            <p className="text-slate-500 text-sm sm:text-base">
              Real experiences from professionals who trust and use our solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120" alt="John Doe" className="w-14 h-14 rounded-full object-cover mb-3" />
              <h5 className="font-semibold text-slate-900 text-sm">John Doe</h5>
              <div className="flex gap-0.5 text-amber-400 my-2">{"★".repeat(5)}</div>
              <p className="text-slate-500 text-xs leading-relaxed">
                I knew I was going to get great service, but you went above and beyond my expectations.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=120" alt="Asa Walter" className="w-14 h-14 rounded-full object-cover mb-3" />
              <h5 className="font-semibold text-slate-900 text-sm">Asa Walter</h5>
              <div className="flex gap-0.5 text-amber-400 my-2">{"★".repeat(5)}</div>
              <p className="text-slate-500 text-xs leading-relaxed">
                This is the best thing that happened to my small business. They re-branded and re-vamped my company.
              </p>
            </div>

            <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-md transform lg:-translate-y-2">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120" alt="Zahid Miles" className="w-16 h-16 rounded-full object-cover mb-3 ring-2 ring-emerald-500/20" />
              <h5 className="font-semibold text-slate-900 text-sm">Zahid Miles</h5>
              <div className="flex gap-0.5 text-amber-400 my-2">{"★".repeat(5)}</div>
              <p className="text-slate-600 text-xs leading-relaxed">
                They are great. They did exactly what I needed. The friendly chaps are a real problem solvers. Loved working with them.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120" alt="Casper Leigh" className="w-14 h-14 rounded-full object-cover mb-3" />
              <h5 className="font-semibold text-slate-900 text-sm">Casper Leigh</h5>
              <div className="flex gap-0.5 text-amber-400 my-2">{"★".repeat(5)}</div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Awesome services. I am really happy to be here because of their services. I will continue to use their services in future.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120" alt="Ciana Aminoff" className="w-14 h-14 rounded-full object-cover mb-3" />
              <h5 className="font-semibold text-slate-900 text-sm">Ciana Aminoff</h5>
              <div className="flex gap-0.5 text-amber-400 my-2">{"★".repeat(5)}</div>
              <p className="text-slate-500 text-xs leading-relaxed">
                By far the best service. This is the efficient services they've put to use. Everyone is so knowledgeable.
              </p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00241b]" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
        </div>
      </section>

      {/* ================= SECTION 8: GET IN TOUCH & MAP ================= */}
      <section className="w-full bg-[#f4f6f1] py-20 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-start">
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div>
                <h2 className="font-serif text-4xl text-[#00241b] font-normal mb-3">Get in touch</h2>
                <div className="w-12 h-[2px] bg-[#c07c34] mb-4" />
                <p className="text-slate-500 text-sm leading-relaxed">
                  Have a question or need help? We're here for you. Reach out and our team will get back to you soon.
                </p>
              </div>

              <div className="flex flex-col gap-6 mt-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100/60 text-[#00241b] flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Email</h5>
                    <p className="text-slate-600 text-sm">coe@senses.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100/60 text-[#00241b] flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Phone</h5>
                    <p className="text-slate-600 text-sm">+01881-232632</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100/60 text-[#00241b] flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Address</h5>
                    <p className="text-slate-600 text-sm">Indian Institute of Technology, Ropar, Punjab, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm">
              <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-700">Your Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Your full name" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#00241b]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-700">Email address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="email" 
                        placeholder="Your email address" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#00241b]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700">Message</label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-3.5 top-4 text-slate-400" />
                    <textarea 
                      rows={4} 
                      placeholder="Write something..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#00241b] resize-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#00241b] hover:bg-[#023629] text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
                >
                  <Send size={16} /> Send Message
                </button>
              </form>
            </div>
          </div>

          <div className="w-full h-80 rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3423.8217316654844!2d76.47131807629532!3d30.975472874467007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3905542fe45e58f7%3A0xedd13e00e00d720b!2sIndian%20Institute%20of%20Technology%20Ropar!5e0!3m2!1sen!2sin!4v1722160000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </section>

    </main>
  );
}