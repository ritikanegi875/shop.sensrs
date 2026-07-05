"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { Heart, ShoppingCart, MoreVertical } from "lucide-react"; // Imported MoreVertical for 3-dot menu
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
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu visibility control state

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
    setIsMenuOpen(false); // Cleanly drop drop-down configurations down on redirect navigation changes
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
      {/* SCOPED MODERN NAVBAR STYLING BLOCK WITH RESPONSIVE MENUS */}
      <style dangerouslySetInnerHTML={{__html: `
        .navbar {
          height: 70px;
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          padding: 0 32px;
          font-family: system-ui, -apple-system, sans-serif;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .navbar-container {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
        }
        .logo a {
          font-size: 22px;
          font-weight: 700;
          color: #000000;
          text-decoration: none;
          letter-spacing: -0.5px;
        }
        .search-box {
          position: relative;
          width: 400px;
        }
        .search-wrapper {
          display: flex;
          align-items: center;
          position: relative;
        }
        .search-wrapper input {
          width: 100%;
          padding: 8px 16px 8px 38px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          outline: none;
          background-color: #f8fafc;
          transition: border-color 0.15s;
        }
        .search-wrapper input:focus {
          border-color: #14321a;
          background-color: #ffffff;
        }
        .search-icon-inside {
          position: absolute;
          left: 12px;
          color: #94a3b8;
          pointer-events: none;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .nav-link-item {
          font-size: 14px;
          font-weight: 500;
          color: #334155;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.15s;
          position: relative;
        }
        .nav-link-item:hover {
          color: #14321a;
        }
        .nav-badge {
          background-color: #e11d48;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 2px;
        }
        .navbar-logout-btn, .navbar-login-btn {
          background-color: #14321a;
          color: #ffffff;
          border: none;
          padding: 8px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.15s;
          display: inline-block;
          text-align: center;
          white-space: nowrap;
        }
        .navbar-logout-btn:hover, .navbar-login-btn:hover {
          background-color: #0f2513;
        }
        .navbar-loading-text {
          font-size: 14px;
          color: #94a3b8;
          font-weight: 500;
        }
        
        /* 3-DOT MENU TOGGLE BUTTON */
        .menu-toggle-btn {
          display: none;
          background: transparent;
          border: none;
          color: #334155;
          cursor: pointer;
          padding: 8px;
          align-items: center;
          justify-content: center;
          transition: color 0.15s;
        }
        .menu-toggle-btn:hover {
          color: #14321a;
        }

        /* RESPONSIVE LAYOUT UPDATES */
        @media (max-width: 900px) {
          .navbar {
            padding: 0 16px;
          }
          .search-box {
            width: 45%; /* Shrink search layout box dynamically to leave room for mobile buttons */
          }
          .menu-toggle-btn {
            display: flex; /* Show 3-dots button */
          }
          
          /* Turn links container into a clean card drop-down dashboard */
          .nav-links {
            display: none;
            position: absolute;
            top: 50px; /* Positioned right under the main elements bar line wrapper */
            right: 0;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            padding: 20px;
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
            width: 240px;
            z-index: 1001;
          }
          
          .nav-links.open {
            display: flex; /* Display menu when active */
          }
          
          .nav-link-item {
            font-size: 15px;
            padding: 8px 4px;
            width: 100%;
          }
          
          .navbar-logout-btn, .navbar-login-btn {
            width: 100%;
            padding: 10px;
          }
        }
        
        @media (max-width: 600px) {
          .navbar-container {
            gap: 8px;
          }
          .logo a {
            font-size: 18px;
          }
          .search-box {
            width: 50%;
          }
        }
      `}} />

      <div className="navbar-container">
        {/* LOGO */}
        <div className="logo">
          <Link href="/">Shop.SEnSRS</Link>
        </div>

        {/* SEARCH WORKSTATION INTEGRATION */}
        <div className="search-box">
          <div className="search-wrapper">
            <FiSearch size={18} className="search-icon-inside" />
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
          </div>
        </div>

        {/* THREE-DOT INTERACTIVE MENU BUTTON FOR RESPONSIVE VIEWPORTS */}
        <button 
          type="button" 
          className="menu-toggle-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <MoreVertical size={24} />
        </button>

        {/* MODERN NAVIGATION OPTIONS CONTAINER */}
        <nav className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <Link href="/products" className="nav-link-item">Products</Link>

          {user?.role === "admin" && (
            <Link href="/admin" className="nav-link-item" style={{ color: "#e11d48", fontWeight: "600" }}>Admin</Link>
          )}
          {user && <Link href="/account" className="nav-link-item">Account</Link>}

          <Link href="/wishlist" className="nav-link-item">
            <Heart size={16} /> Wishlist
            {wishlistCount > 0 && (
              <span className="nav-badge" style={{ backgroundColor: "#14321a" }}>{wishlistCount}</span>
            )}
          </Link>

          <Link href="/cart" className="nav-link-item">
            <ShoppingCart size={16} /> Cart
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </Link>

          {loading ? (
            <span className="navbar-loading-text">Loading...</span>
          ) : user ? (
            <button type="button" className="navbar-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link href="/auth/login" className="navbar-login-btn">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}