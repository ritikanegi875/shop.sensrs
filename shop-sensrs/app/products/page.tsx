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

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(100000);

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

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    );
    return unique;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "all" ? true : product.category === category;

      const matchesPrice = product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, search, category, maxPrice]);

  return (
    <section className="products-page">
      <div className="products-page-header">
        <h1>All Products</h1>
        <p>Browse all available products.</p>
      </div>

      <div className="catalog-layout">
        <aside className="filters-sidebar">
          <h2>Filters</h2>

          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              className="products-search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              className="products-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Max Price: ₹{maxPrice.toLocaleString("en-IN")}</label>
            <input
              type="range"
              min="0"
              max="100000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="price-range"
            />
          </div>

          <button
            type="button"
            className="reset-filters-btn"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setMaxPrice(100000);
            }}
          >
            Reset Filters
          </button>
        </aside>

        <div className="catalog-content">
          {loading ? (
            <p className="empty-admin-records">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="no-products">No products found.</p>
          ) : (
            <div className="products-grid">
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
        </div>
      </div>
    </section>
  );
}