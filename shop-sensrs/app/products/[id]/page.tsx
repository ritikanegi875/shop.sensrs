"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useProducts } from "@/context/ProductContext";
import { useParams } from "next/navigation";

export default function ProductDetail() {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { getProductById } = useProducts();
  const params = useParams();
  const id = Number(params.id);

  const product = getProductById(id);

  if (!product) {
    return <h1>Product not found</h1>;
  }

  const wished = isInWishlist(product.id);

  return (
    <section className="product-detail">
      <div className="product-detail-container">
        <div className="product-detail-image">
          <Image
            src={product.image}
            alt={product.title}
            width={400}
            height={400}
          />
        </div>

        <div className="product-detail-info">
          <h1>{product.title}</h1>
          <p className="category">{product.category}</p>
          <p className="price">₹{product.price.toLocaleString("en-IN")}</p>
          <p className="description">{product.description}</p>

          <div className="detail-actions">
            <button
              onClick={() =>
                addToCart({
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  image: product.image,
                })
              }
            >
              Add to Cart
            </button>

            <button
              className="secondary-btn"
              onClick={() =>
                wished
                  ? removeFromWishlist(product.id)
                  : addToWishlist({
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      image: product.image,
                      category: product.category,
                    })
              }
            >
              {wished ? "Remove from Wishlist" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}