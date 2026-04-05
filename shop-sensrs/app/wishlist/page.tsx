"use client";

import { useRouter } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <section className="wishlist-page">
      <h1>My Wishlist</h1>

      {wishlist.length === 0 ? (
        <p className="empty-admin-records">Your wishlist is empty.</p>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <div className="product-card" key={String(item.id)}>
              <div
                className="product-image-container"
                onClick={() => router.push(`/products/${String(item.id)}`)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="product-image"
                />
              </div>

              <div className="product-info">
                <h3 className="product-title">{item.title}</h3>
                <p className="product-price">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>

                <div className="wishlist-actions">
                  <button
                    type="button"
                    className="add-to-cart-btn"
                    onClick={() =>
                      addToCart({
                        id:
                          typeof item.id === "number"
                            ? item.id
                            : Number(String(item.id).slice(-6).replace(/\D/g, "") || "1"),
                        title: item.title,
                        price: item.price,
                        image: item.image,
                      })
                    }
                  >
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}