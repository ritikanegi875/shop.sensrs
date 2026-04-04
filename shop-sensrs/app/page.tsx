"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
};

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch("/api/banners", {
          cache: "no-store",
        });
        const data = await res.json();

        if (data.success) {
          setBanners(data.banners || []);
        }
      } catch (error) {
        console.error("HOME BANNERS ERROR:", error);
      }
    }

    async function fetchProducts() {
      try {
        const res = await fetch("/api/products", {
          cache: "no-store",
        });
        const data = await res.json();

        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("HOME PRODUCTS ERROR:", error);
      }
    }

    fetchBanners();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners]);

  return (
    <main className="home-page">
      {banners.length > 0 && (
        <section className="hero-banner">
          <div className="hero-banner-inner">
            <Image
              src={banners[index].imageUrl}
              alt="Banner"
              width={1400}
              height={500}
              className="banner-image"
              priority
            />
          </div>
        </section>
      )}

      <FeatureBar />

      <section className="featured-products">
        <div className="section-header">
          <h2>Featured Products</h2>
          <p>Explore our latest and trending electronics</p>
        </div>

        {products.length === 0 ? (
          <p className="empty-admin-records">No products found.</p>
        ) : (
          <div className="products-grid">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product._id}
                _id={product._id}
                title={product.title}
                price={product.price}
                image={product.image}
                category={product.category}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}