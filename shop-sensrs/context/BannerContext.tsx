"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type BannerContextType = {
  banners: string[];
  addBanner: (banner: string) => void;
  removeBanner: (index: number) => void;
  replaceBanner: (index: number, banner: string) => void;
};

const defaultBanners = [
  "/images/banner1.jpg",
  "/images/banner2.jpg",
  "/images/banner3.jpg",
];

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export function BannerProvider({ children }: { children: ReactNode }) {
  const [banners, setBanners] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedBanners = localStorage.getItem("shop-sensrs-banners");

    if (savedBanners) {
      setBanners(JSON.parse(savedBanners));
    } else {
      setBanners(defaultBanners);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("shop-sensrs-banners", JSON.stringify(banners));
    }
  }, [banners, loaded]);

  const addBanner = (banner: string) => {
    setBanners((prev) => [...prev, banner]);
  };

  const removeBanner = (index: number) => {
    setBanners((prev) => prev.filter((_, i) => i !== index));
  };

  const replaceBanner = (index: number, banner: string) => {
    setBanners((prev) =>
      prev.map((item, i) => (i === index ? banner : item))
    );
  };

  return (
    <BannerContext.Provider
      value={{ banners, addBanner, removeBanner, replaceBanner }}
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