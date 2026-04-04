"use client";

import { useEffect, useState } from "react";
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
  const [products, setProducts] = useState<Product[]>([]);
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

  return (
    <section className="products-page">
      <div className="products-page-header">
        <h1>All Products</h1>
        <p>Browse all available electronic items.</p>
      </div>

      {loading ? (
        <p className="empty-admin-records">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="empty-admin-records">No products found.</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
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