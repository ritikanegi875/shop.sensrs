"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <section className="wishlist-page">
      <h1>Your Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <p className="empty-cart">Your wishlist is empty.</p>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map((item) => (
            <div className="product-card" key={item.id}>
              <Link href={`/products/${item.id}`}>
                <div className="product-image-box">
                  <Image src={item.image} alt={item.title} width={220} height={220} />
                </div>

                {item.category && (
                  <span className="product-category">{item.category}</span>
                )}

                <h3>{item.title}</h3>
                <p>₹{item.price.toLocaleString("en-IN")}</p>
              </Link>

              <div className="wishlist-actions">
                <button
                  onClick={() =>
                    addToCart({
                      id: item.id,
                      title: item.title,
                      price: item.price,
                      image: item.image,
                    })
                  }
                >
                  Add to Cart
                </button>

                <button
                  className="remove-btn"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}