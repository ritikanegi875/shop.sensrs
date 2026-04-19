"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  _id: string;
  title: string;
  price: number;
  image: string;
  category?: string;
  hasCustomization?: boolean;
}

export default function ProductCard({
  _id,
  title,
  price,
  image,
  category,
  hasCustomization,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const liked = isInWishlist(_id);

  return (
    <div className="product-card">
      <div
        className="product-image-container"
        onClick={() => router.push(`/products/${_id}`)}
      >
        <img src={image} alt={title} className="product-image" />

        <button
          type="button"
          className="wishlist-toggle"
          onClick={(e) => {
            e.stopPropagation();

            if (liked) {
              removeFromWishlist(_id);
            } else {
              addToWishlist({
                id: _id,
                title,
                price,
                image,
              });
            }
          }}
        >
          {liked ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="product-info">
        {category && <p className="product-category">{category}</p>}

        <h3 className="product-title">{title}</h3>

        <p className="product-price">₹{price.toLocaleString("en-IN")}</p>

        {hasCustomization && (
          <p className="customizable-badge">Customizable Product</p>
        )}

        <button
          type="button"
          className="add-to-cart-btn"
          onClick={() => {
            if (hasCustomization) {
              router.push(`/products/${_id}`);
              return;
            }

            addToCart({
              id: _id,
              title,
              price,
              image,
            });
          }}
        >
          {hasCustomization ? "Customize" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}