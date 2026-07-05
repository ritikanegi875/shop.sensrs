"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";

type Product = {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  hasCustomization?: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Core replica filtering state definitions
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [depthRating, setDepthRating] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(1000000); 

  useEffect(() => {
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
        console.error("PRODUCTS PAGE ERROR:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const categoriesList = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  const handleCategoryToggle = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);

      const matchesPrice = product.price <= maxPrice;

      const matchesDepth = 
        depthRating === "all" ? true :
        depthRating === "shallow" ? product.price < 300000 :
        depthRating === "deep" ? product.price >= 300000 : true;

      return matchesCategory && matchesPrice && matchesDepth;
    });
  }, [products, selectedCategories, maxPrice, depthRating]);

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-10 md:px-8 bg-white text-[#0c1c18] font-sans">
      
      {/* HEADER TITLE BLOCK */}
      <div className="border-b border-slate-100 pb-6">
        <h1 className="font-serif text-[2.5rem] font-normal text-[#00241b] m-0">
          All Products
        </h1>
        <p className="text-slate-500 text-[1.05rem] mt-1.5">
          Deploy custom automated marine diagnostics systems certified by the Indian Institute of Technology Ropar.
        </p>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-12 mt-8 items-start">
        
        {/* ================= REPLICA SIDEBAR FILTERS ================= */}
        <aside className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-9 md:sticky md:top-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          
          {/* Sidebar Top Controls Header */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h2 className="font-serif text-xl font-medium text-[#00241b] m-0">Filters</h2>
            <button 
              type="button" 
              onClick={() => {
                setSelectedCategories([]);
                setDepthRating("all");
                setMaxPrice(1000000);
              }}
              className="bg-transparent border-none text-slate-400 hover:text-rose-500 text-sm font-medium cursor-pointer p-0 transition-colors duration-150 hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Category Checkbox Multi-Filters */}
          <div>
            <span className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Category</span>
            <div className="flex flex-col gap-3.5">
              {categoriesList.map((item) => {
                const isChecked = selectedCategories.includes(item);
                return (
                  <label key={item} className="flex items-center gap-3 text-[15px] text-slate-600 hover:text-[#00241b] cursor-pointer select-none transition-colors duration-150">
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCategoryToggle(item)}
                      className="w-[1.15rem] h-[1.15rem] border border-slate-300 rounded bg-white appearance-none cursor-pointer flex items-center justify-center transition-all duration-150 checked:bg-[#00241b] checked:border-[#00241b] checked:before:content-['✓'] checked:before:text-white checked:before:text-[10px] checked:before:font-bold"
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
              {categoriesList.length === 0 && (
                <span className="text-xs text-slate-400 font-medium italic">No categories parsed.</span>
              )}
            </div>
          </div>

          {/* Depth Rating Radio Single Filters */}
          <div>
            <span className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Depth Rating</span>
            <div className="flex flex-col gap-3.5">
              <label className="flex items-center gap-3 text-[15px] text-slate-600 hover:text-[#00241b] cursor-pointer select-none transition-colors duration-150">
                <input 
                  type="radio" 
                  name="depth-filter"
                  checked={depthRating === "all"}
                  onChange={() => setDepthRating("all")}
                  className="w-[1.15rem] h-[1.15rem] border border-slate-300 rounded-full bg-white appearance-none cursor-pointer flex items-center justify-center transition-all duration-150 checked:border-[#00241b] checked:border-[5px]"
                />
                <span>All Deployments</span>
              </label>
              
              <label className="flex items-center gap-3 text-[15px] text-slate-600 hover:text-[#00241b] cursor-pointer select-none transition-colors duration-150">
                <input 
                  type="radio" 
                  name="depth-filter"
                  checked={depthRating === "shallow"}
                  onChange={() => setDepthRating("shallow")}
                  className="w-[1.15rem] h-[1.15rem] border border-slate-300 rounded-full bg-white appearance-none cursor-pointer flex items-center justify-center transition-all duration-150 checked:border-[#00241b] checked:border-[5px]"
                />
                <span>Surface to 10m (Standard)</span>
              </label>

              <label className="flex items-center gap-3 text-[15px] text-slate-600 hover:text-[#00241b] cursor-pointer select-none transition-colors duration-150">
                <input 
                  type="radio" 
                  name="depth-filter"
                  checked={depthRating === "deep"}
                  onChange={() => setDepthRating("deep")}
                  className="w-[1.15rem] h-[1.15rem] border border-slate-300 rounded-full bg-white appearance-none cursor-pointer flex items-center justify-center transition-all duration-150 checked:border-[#00241b] checked:border-[5px]"
                />
                <span>Deep Sea 1000m+ (Exploration)</span>
              </label>
            </div>
          </div>

          {/* Investment Range Input System Slider */}
          <div>
            <span className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">Investment Range</span>
            <div className="mt-2">
              <input 
                type="range"
                min="5000"
                max="1000000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none outline-none my-4 cursor-pointer accent-[#00241b]"
              />
              <div className="flex justify-between text-xs text-slate-400 font-semibold mt-2">
                <span>₹5,000</span>
                <span className="text-[#00241b] font-bold">Up to: ₹{maxPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ================= CATALOG PLATFORM RENDERING PORT ================= */}
        <section className="flex flex-col gap-8">
          {loading ? (
            <p className="text-center text-slate-400 font-medium py-16">Loading asset data blueprints from SEnSRS networks...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-slate-400 font-medium py-16 text-[1.05rem]">No compatible custom platforms match your selection parameters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
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
    </section>
  );
}