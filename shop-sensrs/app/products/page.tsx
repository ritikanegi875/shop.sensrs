"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";

type Product = {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  description: string;
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [loading, setLoading] = useState(true);

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
    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.category || "Uncategorized"))
    );
    return ["All", ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(search);

      const matchesCategory =
        selectedCategory === "All" ||
        (product.category || "Uncategorized") === selectedCategory;

      const matchesPrice = product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, search, selectedCategory, maxPrice]);

  return (
    <section className="products-page">
      <div className="products-page-header">
        <h1>All Products</h1>
        <p>Browse all available products.</p>
      </div>

      <div className="products-filters">
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`filter-chip ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="price-filter-box">
          <label htmlFor="priceRange">
            Max Price: ₹{maxPrice.toLocaleString("en-IN")}
          </label>
          <input
            id="priceRange"
            type="range"
            min="0"
            max="100000"
            step="500"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </div>
      </div>

      {loading ? (
        <p className="empty-admin-records">Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="empty-admin-records">No products found.</p>
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
            />
          ))}
        </div>
      )}
    </section>
  );
}