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
}

export default function ProductCard({
  _id,
  title,
  price,
  image,
  category,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const numericId = Number(_id.slice(-6).replace(/\D/g, "") || "1");
  const inWishlist = isInWishlist(_id);

  const handleWishlistToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (inWishlist) {
      removeFromWishlist(_id);
    } else {
      addToWishlist({
        id: _id,
        title,
        price,
        image,
      });
    }
  };

  return (
    <div className="product-card">
      <div
        className="product-image-container"
        onClick={() => router.push(`/products/${_id}`)}
      >
        <img src={image} alt={title} className="product-image" />

        <button
          type="button"
          className="wishlist-btn"
          onClick={handleWishlistToggle}
        >
          {inWishlist ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="product-info">
        {category && <p className="product-category">{category}</p>}

        <h3 className="product-title">{title}</h3>

        <p className="product-price">₹{price.toLocaleString("en-IN")}</p>

        <button
          type="button"
          className="add-to-cart-btn"
          onClick={() =>
            addToCart({
              id: numericId,
              title,
              price,
              image,
            })
          }
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}