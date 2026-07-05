"use client";

import { useRouter } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <section className="bg-white px-6 py-12 md:px-12 max-w-[1400px] mx-auto font-sans">
      {/* PAGE HEADER */}
      <h1 className="text-3xl font-bold text-black mb-8">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <p className="text-center text-slate-400 font-medium py-12">Your wishlist is empty.</p>
      ) : (
        /* WISHLIST MATRIX GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div 
              key={String(item.id)} 
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
            >
              {/* COMPONENT IMAGE CONTEXT PANEL */}
              <div
                className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-2xl bg-slate-50"
                onClick={() => router.push(`/products/${String(item.id)}`)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* OVERLAY: HARDWARE SPECIFICATION BADGE */}
                <span className="absolute left-3 top-3 rounded-full bg-[#b89047] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  NEW
                </span>
              </div>

              {/* CARD DETAILS PRESENTATION PANE */}
              <div className="mt-4 flex flex-col flex-grow">
                
                {/* ACTION TRIGGER INTERFACE ACTION HOUSING */}
                <div className="flex flex-col gap-3 mb-4 order-first">
                  
                  {/* REMOVE BUTTON COMPONENT */}
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    className="w-fit bg-[#333333] hover:bg-black text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors duration-150 active:scale-95"
                  >
                    Remove
                  </button>

                  {/* CART ADDITION CONTROLLER ELEMENT */}
                  <button
                    type="button"
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
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00241b] text-white transition-colors duration-150 hover:bg-[#023629] active:scale-95"
                    aria-label="Add hardware system profile to cart config"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth="2.5" 
                      stroke="currentColor" 
                      className="h-5 w-5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>

                {/* SERIF SYSTEM PROFILE TITLE */}
                <h3 
                  onClick={() => router.push(`/products/${String(item.id)}`)}
                  className="mt-1 font-serif text-xl font-normal text-[#00241b] cursor-pointer hover:underline line-clamp-2 min-h-[3.5rem]"
                >
                  {item.title}
                </h3>

                {/* DOMESTIC CURRENCY TAG */}
                <div className="mt-auto pt-2">
                  <span className="inline-block rounded-full bg-[#b89047] px-4 py-1.5 text-sm font-semibold text-white">
                    ₹{item.price.toLocaleString("en-IN")}
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}