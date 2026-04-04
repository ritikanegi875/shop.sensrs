"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

type AuthUser = {
  userId: string;
  email: string;
  role: string;
} | null;

export default function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = () => {
    const trimmedSearch = search.trim();

    if (trimmedSearch) {
      router.push(`/products?search=${encodeURIComponent(trimmedSearch)}`);
    } else {
      router.push("/products");
    }
  };

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("AUTH FETCH ERROR:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        setUser(null);
        router.push("/auth/login");
        router.refresh();
      }
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
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

          {user?.role === "admin" && <Link href="/admin">Admin</Link>}

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

          {loading ? (
            <span className="login-btn">Loading...</span>
          ) : user ? (
            <button type="button" className="login-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link href="/auth/login" className="login-btn">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}