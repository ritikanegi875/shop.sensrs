"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

type Product = {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  description: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (data.success) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error("FETCH PRODUCT DETAIL ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return <p className="empty-admin-records">Loading product...</p>;
  }

  if (!product) {
    return <p className="empty-admin-records">Product not found.</p>;
  }

  return (
    <section className="product-detail-page">
      <div className="product-detail-card">
        <div className="product-detail-image">
          <Image
            src={product.image}
            alt={product.title}
            width={500}
            height={500}
          />
        </div>

        <div className="product-detail-content">
          <span className="product-category">{product.category}</span>
          <h1>{product.title}</h1>
          <p className="product-detail-price">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          <p className="product-detail-description">{product.description}</p>

          <div className="detail-actions">
            <button
              className="primary-btn"
              onClick={() =>
                addToCart({
                  id: Number(product._id.slice(-6).replace(/\D/g, "") || "1"),
                  title: product.title,
                  price: product.price,
                  image: product.image,
                })
              }
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}