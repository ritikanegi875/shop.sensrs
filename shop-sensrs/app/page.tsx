"use client";

import Banner from "@/components/Banner";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductContext";


export default function HomePage() {
  const { featuredProducts } = useProducts();

  return (
    <section className="home-page">
      <Banner />

      <div className="products-section">
        <h2>Featured Products</h2>

        <div className="products-grid">
          {featuredProducts.map((product) => (
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
      </div>
    </section>
  );
}