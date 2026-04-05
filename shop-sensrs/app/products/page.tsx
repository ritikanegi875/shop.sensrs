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
  const searchQuery = (searchParams.get("search") || "").toLowerCase().trim();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
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
        console.error("FETCH PRODUCTS ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    );
    return ["All", ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchesSearch =
        !searchQuery ||
        product.title.toLowerCase().includes(searchQuery) ||
        product.category.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <section className="products-page">
      <div className="products-page-header">
        <h1>All Products</h1>
        <p>Browse all available products.</p>
      </div>

      <div className="product-filter-bar">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`filter-btn ${
              selectedCategory === category ? "active-filter-btn" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {searchQuery && (
        <p className="search-results-text">
          Search results for: <strong>{searchQuery}</strong>
        </p>
      )}

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