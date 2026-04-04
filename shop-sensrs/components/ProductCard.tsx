"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

type Props = {
  id: number;
  title: string;
  price: number;
  image: string;
  category?: string;
};

export default function ProductCard({
  id,
  title,
  price,
  image,
  category,
}: Props) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const wished = isInWishlist(id);

  return (
    <div className="product-card">
      <button
        type="button"
        className="wishlist-toggle"
        onClick={() =>
          wished
            ? removeFromWishlist(id)
            : addToWishlist({ id, title, price, image, category })
        }
      >
        {wished ? "♥" : "♡"}
      </button>

      <Link href={`/products/${id}`}>
        <div className="product-image-box">
          <Image src={image} alt={title} width={220} height={220} />
        </div>

        {category && <span className="product-category">{category}</span>}

        <h3>{title}</h3>
        <p>₹{price.toLocaleString("en-IN")}</p>
      </Link>

      <button
        type="button"
        className="add-cart-btn"
        onClick={() =>
          addToCart({
            id,
            title,
            price,
            image,
          })
        }
      >
        Add to Cart
      </button>
    </div>
  );
}