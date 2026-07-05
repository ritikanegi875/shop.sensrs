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
    <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      
      {/* CARD TOP AREA: IMAGE HOUSING CONTAINER */}
      <div
        className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-2xl bg-slate-50"
        onClick={() => router.push(`/products/${_id}`)}
      >
        <img 
          src={image} 
          alt={title} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
        />

        {/* TOP LEFT OVERLAY: NEW ITEM TAG */}
        <span className="absolute left-3 top-3 rounded-full bg-[#b89047] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
          NEW
        </span>

        {/* TOP RIGHT OVERLAY: DYNAMIC HEART WISHLIST ACCENT */}
        <button
          type="button"
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
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-lg shadow-sm backdrop-blur-sm transition-transform duration-150 active:scale-90 hover:bg-white"
        >
          {liked ? "❤️" : "🤍"}
        </button>

        {/* BOTTOM CENTER OVERLAY: CUSTOMIZABLE BADGE */}
        {hasCustomization && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1.5 shadow-sm">
            <p className="whitespace-nowrap text-[10px] font-semibold tracking-wide text-slate-700">
              Customizable Product
            </p>
          </div>
        )}
      </div>

      {/* CARD BOTTOM AREA: DATA PRESENTATION PANEL */}
      <div className="mt-4 flex flex-col flex-grow">
        
        {/* SUB-CATEGORY DESIGNATION LABELS */}
        {category && (
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {category}
          </p>
        )}

        {/* SERIF HEADING COMPONENT */}
        <h3 
          onClick={() => router.push(`/products/${_id}`)}
          className="mt-1 font-serif text-xl font-normal text-[#00241b] cursor-pointer hover:underline line-clamp-2 min-h-[3.5rem]"
        >
          {title}
        </h3>

        {/* BOTTOM GRID INTERACTION SYSTEM */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          
          {/* INDIAN RUPEE METRIC TAG */}
          <div className="rounded-full bg-[#b89047] px-4 py-1.5 text-sm font-semibold text-white">
            ₹{price.toLocaleString("en-IN")}
          </div>

          {/* DYNAMIC ACTION TRIGGER BUTTON */}
          <button
            type="button"
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
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00241b] text-white transition-colors duration-150 hover:bg-[#023629] active:scale-95"
            aria-label={hasCustomization ? "Customize system configuration" : "Add item to cart profile"}
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
      </div>

    </div>
  );
}