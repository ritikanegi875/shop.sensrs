"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { Heart, ShoppingCart, MoreVertical } from "lucide-react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    setIsMenuOpen(false);
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
    <header className="sticky top-0 z-50 h-[70px] border-b border-slate-200 bg-white px-4 md:px-8 flex items-center font-sans">
      <div className="relative mx-auto flex w-full max-w-[1400px] items-center justify-between">
        
        {/* LOGO */}
        <div className="font-serif text-xl font-bold tracking-tight text-black sm:text-2xl">
          <Link href="/">Shop.SEnSRS</Link>
        </div>

        {/* SEARCH BOX */}
        <div className="relative w-[50%] sm:w-[45%] md:w-[400px]">
          <div className="relative flex items-center">
            <FiSearch size={18} className="pointer-events-none absolute left-3 text-slate-400" />
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
              className="w-full rounded-lg border border-slate-200 bg-[#f8fafc] py-2 pl-[38px] pr-4 text-sm outline-none transition-colors duration-150 focus:border-[#14321a] focus:bg-white"
            />
          </div>
        </div>

        {/* THREE-DOT MOBILE MENU TOGGLE */}
        <button
          type="button"
          className="flex p-2 text-slate-700 hover:text-[#14321a] md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <MoreVertical size={24} />
        </button>

        {/* NAVIGATION LINKS CONTAINER */}
        <nav
          className={`
            absolute right-0 top-[50px] z-[1001] w-[240px] flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-lg md:shadow-none
            md:static md:flex md:w-auto md:flex-row md:items-center md:gap-6 md:border-none md:p-0 
            ${isMenuOpen ? "flex" : "hidden md:flex"}
          `}
        >
          <Link href="/products" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:text-[#14321a]">
            Products
          </Link>

          {user?.role === "admin" && (
            <Link href="/admin" className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 transition-colors duration-150">
              Admin
            </Link>
          )}

          {user && (
            <Link href="/account" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:text-[#14321a]">
              Account
            </Link>
          )}

          {/* WISHLIST */}
          <Link href="/wishlist" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:text-[#14321a]">
            <Heart size={16} /> 
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="ml-0.5 rounded-full bg-[#14321a] px-2 py-0.5 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* CART */}
          <Link href="/cart" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:text-[#14321a]">
            <ShoppingCart size={16} /> 
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="ml-0.5 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* AUTH STATUS ACTION BUTTONS */}
          {loading ? (
            <span className="text-sm font-medium text-slate-400">Loading...</span>
          ) : user ? (
            <button
              type="button"
              className="inline-block rounded-md bg-[#14321a] px-5 py-2 text-center whitespace-nowrap text-sm font-medium text-white transition-colors duration-150 hover:bg-[#0f2513] w-full md:w-auto"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="inline-block rounded-md bg-[#14321a] px-5 py-2 text-center whitespace-nowrap text-sm font-medium text-white transition-colors duration-150 hover:bg-[#0f2513] w-full md:w-auto"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}