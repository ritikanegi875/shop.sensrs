"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

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
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

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

    if (id) fetchProduct();
  }, [id]);

  const cartItem = useMemo(() => {
    if (!product) return null;

    return {
      id: Number(product._id.slice(-6).replace(/\D/g, "")) || 1,
      title: product.title,
      price: product.price,
      image: product.image,
    };
  }, [product]);

  const wishlistItem = useMemo(() => {
    if (!product) return null;

    return {
      id: product._id,
      title: product.title,
      price: product.price,
      image: product.image,
    };
  }, [product]);

  if (loading) {
    return <p className="empty-admin-records">Loading product...</p>;
  }

  if (!product || !cartItem || !wishlistItem) {
    return <p className="empty-admin-records">Product not found.</p>;
  }

  const inWishlist = isInWishlist(wishlistItem.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(cartItem);
    }
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(cartItem);
    }
    router.push("/checkout");
  };

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(wishlistItem.id);
    } else {
      addToWishlist(wishlistItem);
    }
  };

  return (
    <section className="product-detail-page">
      <div className="product-detail-card">
        <div className="product-detail-image">
          <Image
            src={product.image}
            alt={product.title}
            width={600}
            height={600}
          />
        </div>

        <div className="product-detail-content">
          <span className="product-category">{product.category}</span>
          <h1>{product.title}</h1>

          <p className="product-detail-price">
            ₹{product.price.toLocaleString("en-IN")}
          </p>

          <p className="product-detail-description">{product.description}</p>

          <div className="quantity-box">
            <span>Quantity</span>
            <div className="quantity-controls">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="detail-actions">
            <button className="primary-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>

            <button className="secondary-btn" onClick={handleBuyNow}>
              Buy Now
            </button>

            <button className="secondary-btn" onClick={handleWishlist}>
              {inWishlist ? "Remove Wishlist" : "Add Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}