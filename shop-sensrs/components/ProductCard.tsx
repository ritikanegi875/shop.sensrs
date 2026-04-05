"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

type Props = {
  _id?: string;
  id?: number;
  title: string;
  price: number;
  image: string;
  category?: string;
};

export default function ProductCard({
  _id,
  id,
  title,
  price,
  image,
  category,
}: Props) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const productId = _id ?? String(id ?? "");

  const inWishlist = isInWishlist(productId);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const derivedId = Number(String(_id ?? "").slice(-6).replace(/\D/g, "")) || 1;
const cartId = id ?? derivedId;

    addToCart({
      id: cartId,
      title,
      price,
      image,
    });
  };

  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeFromWishlist(productId);
    } else {
      addToWishlist({
        id: productId,
        title,
        price,
        image,
      });
    }
  };

  return (
    <div className="product-card">
      <Link href={`/products/${_id || id}`}>
        <div className="product-image-box">
          <Image src={image} alt={title} width={260} height={220} />
        </div>
      </Link>

      <button
        type="button"
        className="wishlist-heart-btn"
        onClick={handleWishlist}
      >
        {inWishlist ? "♥" : "♡"}
      </button>

      {category && <span className="product-category">{category}</span>}

      <Link href={`/products/${_id || id}`} className="product-card-title-link">
        <h3>{title}</h3>
      </Link>

      <p>₹{price.toLocaleString("en-IN")}</p>

      <button type="button" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}