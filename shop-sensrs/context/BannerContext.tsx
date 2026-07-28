"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type BannerItem = {
  _id: string;
  imageUrl: string;
  category?: string; // Must match our new database field
};

type BannerContextType = {
  banners: string[]; // Explicitly for the Hero Slider
  bannerTwoUrl: string; // Explicitly for Banner Two
  loading: boolean;
  refreshBanners: () => Promise<void>;
};

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export function BannerProvider({ children }: { children: ReactNode }) {
  const [banners, setBanners] = useState<string[]>([]);
  const [bannerTwoUrl, setBannerTwoUrl] = useState<string>("https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1920");
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners", { cache: "no-store" });
      const data = await res.json();

      if (data.success && data.banners) {
        const allBanners: BannerItem[] = data.banners;

        // STRICT SEPARATION: Only grab banners where category is "hero" (or undefined for legacy)
        const heroList = allBanners
          .filter((b) => !b.category || b.category === "hero")
          .map((b) => b.imageUrl);

        // STRICT SEPARATION: Only grab the banner where category is "banner-two"
        const bannerTwoItem = allBanners.find((b) => b.category === "banner-two");

        if (heroList.length > 0) {
          setBanners(heroList);
        } else {
          // Fallback if no hero banners exist
          setBanners([
            "/images/banner1.jpg",
            "/images/banner2.jpg",
            "/images/banner3.jpg",
          ]);
        }

        if (bannerTwoItem && bannerTwoItem.imageUrl) {
          setBannerTwoUrl(bannerTwoItem.imageUrl);
        }
      }
    } catch (error) {
      console.error("CONTEXT FETCH BANNERS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <BannerContext.Provider
      value={{ 
        banners, 
        bannerTwoUrl, 
        loading, 
        refreshBanners: fetchBanners 
      }}
    >
      {children}
    </BannerContext.Provider>
  );
}

export function useBanners() {
  const context = useContext(BannerContext);

  if (!context) {
    throw new Error("useBanners must be used inside BannerProvider");
  }

  return context;
}