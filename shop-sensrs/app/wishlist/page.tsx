"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <section className="products-page">
      <div className="products-page-header">
        <h1>My Wishlist</h1>
        <p>Your saved products appear here.</p>
      </div>

      {wishlist.length === 0 ? (
        <p className="empty-admin-records">No items in wishlist.</p>
      ) : (
        <div className="products-grid">
          {wishlist.map((item) => (
            <div key={String(item.id)} className="product-card">
              <Link href={`/products/${item.id}`}>
                <div className="product-image-box">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={260}
                    height={220}
                  />
                </div>
              </Link>

              <span className="product-category">Wishlist</span>

              <Link
                href={`/products/${item.id}`}
                className="product-card-title-link"
              >
                <h3>{item.title}</h3>
              </Link>

              <p>₹{item.price.toLocaleString("en-IN")}</p>

              <button
                type="button"
                className="delete-btn"
                onClick={() => removeFromWishlist(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}