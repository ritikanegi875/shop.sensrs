"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const trimmedSearch = search.trim();

    if (trimmedSearch) {
      router.push(`/products?search=${encodeURIComponent(trimmedSearch)}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <Link href="/">Shop.SEnSRS</Link>
        </div>

        <div className="search-box">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search electronics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            <button
              type="button"
              onClick={handleSearch}
              className="search-icon-btn"
            >
              <FiSearch />
            </button>
          </div>
        </div>

        <nav className="nav-links">
          <Link href="/products">Products</Link>
          <Link href="/admin">Admin</Link>

          <Link href="/wishlist" className="wishlist-link">
            Wishlist
            {wishlistCount > 0 && (
              <span className="wishlist-badge">{wishlistCount}</span>
            )}
          </Link>

          <Link href="/cart" className="cart-link">
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          <Link href="/auth/login" className="login-btn">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}