"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductContext";

export default function ProductsPage() {
  const { products } = useProducts();
  const searchParams = useSearchParams();
  const querySearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(querySearch);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [maxPrice, setMaxPrice] = useState(5000);

  useEffect(() => {
    setSearchTerm(querySearch);
  }, [querySearch]);

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchesPrice = product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    const sorted = [...filtered];

    switch (sortBy) {
      case "price-low-high":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name-a-z":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-z-a":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    return sorted;
  }, [products, searchTerm, selectedCategory, sortBy, maxPrice]);

  return (
    <section className="products-page">
      <div className="products-page-header">
        <h1>All Products</h1>
        <p>Browse all available electronic items.</p>
      </div>

      <div className="catalog-layout">
        <aside className="filters-sidebar">
          <h2>Filters</h2>

          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="products-search"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="products-select"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort">Sort By</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="products-select"
            >
              <option value="default">Default</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="name-a-z">Name: A to Z</option>
              <option value="name-z-a">Name: Z to A</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="price">
              Max Price: ₹{maxPrice.toLocaleString("en-IN")}
            </label>
            <input
              id="price"
              type="range"
              min="500"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="price-range"
            />
          </div>

          <button
            type="button"
            className="reset-filters-btn"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setSortBy("default");
              setMaxPrice(5000);
            }}
          >
            Reset Filters
          </button>
        </aside>

        <div className="catalog-content">
          {filteredProducts.length === 0 ? (
            <p className="no-products">No products found.</p>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  category={product.category}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}