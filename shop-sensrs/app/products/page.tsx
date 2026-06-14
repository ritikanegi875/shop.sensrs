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

  // Core replica filtering state definitions (Search removed)
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
    <section className="catalog-container">
      {/* Integrated Single File CSS Styling Rules Blueprint */}
      <style dangerouslySetInnerHTML={{__html: `
        .catalog-container { max-width: 1400px; margin: 0 auto; padding: 2.5rem 2rem; font-family: system-ui, -apple-system, sans-serif; background: #ffffff; color: #0c1c18; }
        .catalog-layout-grid { display: grid; grid-template-columns: 300px 1fr; gap: 3rem; margin-top: 2rem; align-items: flex-start; }
        
        .replica-sidebar { background: #ffffff; border: 1px solid #e2e8f0; padding: 1.5rem; border-radius: 12px; display: flex; flex-direction: column; gap: 2.25rem; position: sticky; top: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
        .sidebar-title-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f3f5; padding-bottom: 1rem; }
        .sidebar-title-row h2 { font-size: 1.35rem; font-weight: 500; font-family: Georgia, serif; color: #00241b; margin: 0; }
        .btn-reset-text { background: transparent; border: none; color: #64748b; font-size: 0.85rem; font-weight: 500; cursor: pointer; padding: 0; transition: color 0.15s; }
        .btn-reset-text:hover { color: #ef4444; text-decoration: underline; }
        .section-label { font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1rem; display: block; }
        .filter-item-list { display: flex; flex-direction: column; gap: 0.85rem; }
        .replica-checkbox-label, .replica-radio-label { display: flex; align-items: center; gap: 0.75rem; font-size: 0.95rem; color: #334155; cursor: pointer; user-select: none; transition: color 0.15s; }
        .replica-checkbox-label:hover, .replica-radio-label:hover { color: #00241b; }
        .replica-checkbox { width: 1.15rem; height: 1.15rem; border: 1px solid #cbd5e1; border-radius: 4px; appearance: none; display: grid; place-content: center; cursor: pointer; background: #fff; transition: background 0.15s, border-color 0.15s; }
        .replica-checkbox:checked { background: #00241b; border-color: #00241b; }
        .replica-checkbox:checked::before { content: "✓"; color: white; font-size: 0.75rem; font-weight: bold; }
        .replica-radio { width: 1.15rem; height: 1.15rem; border: 1px solid #cbd5e1; border-radius: 50%; appearance: none; display: grid; place-content: center; cursor: pointer; background: #fff; transition: border-color 0.15s; }
        .replica-radio:checked { border-color: #00241b; border-width: 5px; }
        .price-slider-wrapper { margin-top: 0.5rem; }
        .price-output-labels { display: flex; justify-content: space-between; font-size: 0.8rem; color: #64748b; font-weight: 600; margin-top: 0.5rem; }
        .replica-range-slider { width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px; appearance: none; outline: none; margin: 1rem 0; cursor: pointer; }
        .replica-range-slider::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #00241b; cursor: pointer; box-shadow: 0 0 0 4px #ffffff, 0 1px 3px rgba(0,0,0,0.15); transition: transform 0.1s; }
        .replica-range-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
        
        .catalog-main-content { display: flex; flex-direction: column; gap: 2rem; }
        .replica-grid-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(285px, 1fr)); gap: 1.5rem; }
        .empty-grid-p { text-align: center; color: #64748b; padding: 4rem 2rem; font-size: 1.05rem; }
      `}} />

      <div style={{ borderBottom: "1px solid #f1f3f5", paddingBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2.5rem", fontWeight: "400", color: "#00241b", margin: 0 }}>
          All Products
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.05rem", marginTop: "0.35rem" }}>
          Deploy custom automated marine diagnostics systems certified by the Indian Institute of Technology Ropar.
        </p>
      </div>

      <div className="catalog-layout-grid">
        
        {/* ================= REPLICA SIDEBAR FILTERS ================= */}
        <aside className="replica-sidebar">
          <div className="sidebar-title-row">
            <h2>Filters</h2>
            <button 
              type="button" 
              className="btn-reset-text"
              onClick={() => {
                setSelectedCategories([]);
                setDepthRating("all");
                setMaxPrice(1000000);
              }}
            >
              Reset
            </button>
          </div>

          <div>
            <span className="section-label">Category</span>
            <div className="filter-item-list">
              {categoriesList.map((item) => {
                const isChecked = selectedCategories.includes(item);
                return (
                  <label key={item} className="replica-checkbox-label">
                    <input 
                      type="checkbox"
                      className="replica-checkbox"
                      checked={isChecked}
                      onChange={() => handleCategoryToggle(item)}
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
              {categoriesList.length === 0 && (
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>No categories parsed.</span>
              )}
            </div>
          </div>

          <div>
            <span className="section-label">Depth Rating</span>
            <div className="filter-item-list">
              <label className="replica-radio-label">
                <input 
                  type="radio" 
                  name="depth-filter"
                  className="replica-radio"
                  checked={depthRating === "all"}
                  onChange={() => setDepthRating("all")}
                />
                <span>All Deployments</span>
              </label>
              
              <label className="replica-radio-label">
                <input 
                  type="radio" 
                  name="depth-filter"
                  className="replica-radio"
                  checked={depthRating === "shallow"}
                  onChange={() => setDepthRating("shallow")}
                />
                <span>Surface to 10m (Standard)</span>
              </label>

              <label className="replica-radio-label">
                <input 
                  type="radio" 
                  name="depth-filter"
                  className="replica-radio"
                  checked={depthRating === "deep"}
                  onChange={() => setDepthRating("deep")}
                />
                <span>Deep Sea 1000m+ (Exploration)</span>
              </label>
            </div>
          </div>

          <div>
            <span className="section-label">Investment Range</span>
            <div className="price-slider-wrapper">
              <input 
                type="range"
                className="replica-range-slider"
                min="5000"
                max="1000000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <div className="price-output-labels">
                <span>₹5,000</span>
                <span style={{ color: "#00241b", fontWeight: "700" }}>Up to: ₹{maxPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ================= CATALOG PLATFORM RENDERING PORT ================= */}
        <section className="catalog-main-content">
          {loading ? (
            <p className="empty-admin-records">Loading asset data blueprints from SEnSRS networks...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="empty-grid-p">No compatible custom platforms match your selection parameters.</p>
          ) : (
            <div className="replica-grid-view">
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