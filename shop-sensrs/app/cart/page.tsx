"use client";

import { useEffect, useState, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

type CustomizationOption = {
  label: string;
  price: number;
  isDefault: boolean;
  spec1?: string;
  spec2?: string;
  spec3?: string;
};

type CustomizationGroup = {
  name: string;
  type: "single";
  specLabels: {
    label1: string;
    label2: string;
    label3: string;
  };
  options: CustomizationOption[];
};

type ProductBlueprint = {
  _id: string;
  title: string;
  price: number;
  customizations?: CustomizationGroup[];
};

type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  selectedCustomizations: Record<string, string>;
};

export default function CartPage() {
  const { cartItems, removeFromCart } = useCart() as unknown as {
    cartItems: CartItem[];
    removeFromCart: (id: string, customizations: Record<string, string>) => void;
  };

  const router = useRouter();

  const [blueprints, setBridges] = useState<Record<string, ProductBlueprint>>({});
  const [loadingBlueprints, setLoadingBlueprints] = useState(true);

  useEffect(() => {
    async function loadAllBlueprints() {
      if (cartItems.length === 0) {
        setLoadingBlueprints(false);
        return;
      }
      try {
        const fetchPromises = cartItems.map(async (item) => {
          if (blueprints[item.id]) return null;
          const res = await fetch(`/api/products/${item.id}`, { cache: "no-store" });
          const data = await res.json();
          return data.success && data.product ? data.product : null;
        });

        const results = await Promise.all(fetchPromises);
        const newBlueprints = { ...blueprints };
        
        results.forEach((bp) => {
          if (bp !== null) {
            newBlueprints[bp._id] = bp;
          }
        });

        setBridges(newBlueprints);
      } catch (error) {
        console.error("MULTIPLE BLUEPRINTS FETCH ERROR:", error);
      } finally {
        setLoadingBlueprints(false);
      }
    }

    loadAllBlueprints();
  }, [cartItems]);

  const detailedCartItems = useMemo(() => {
    return cartItems.map((item) => {
      const blueprint = blueprints[item.id];
      const coreHardware: Array<{ tabName: string; chosenLabel: string; isDefault: boolean }> = [];
      const upgrades: Array<{ tabName: string; chosenLabel: string; isDefault: boolean; priceDelta: number }> = [];

      let simulatedUpchargeTotal = 0;
      const basePrice = blueprint ? Number(blueprint.price) : Number(item.price * 0.75);

      if (blueprint?.customizations) {
        blueprint.customizations.forEach((group) => {
          const chosenLabel = item.selectedCustomizations?.[group.name];
          if (!chosenLabel) return;

          const matchingOption = group.options.find((o) => o.label === chosenLabel);
          const isChosenDefault = matchingOption ? matchingOption.isDefault : false;
          const upcharge = matchingOption ? Number(matchingOption.price) : 0;

          simulatedUpchargeTotal += upcharge;

          if (coreHardware.length < 3) {
            coreHardware.push({ tabName: group.name, chosenLabel, isDefault: isChosenDefault });
          } else {
            upgrades.push({ tabName: group.name, chosenLabel, isDefault: isChosenDefault, priceDelta: upcharge });
          }
        });
      } else {
        Object.entries(item.selectedCustomizations ?? {}).forEach(([key, value], index) => {
          if (index < 3) {
            coreHardware.push({ tabName: key, chosenLabel: String(value), isDefault: true });
          } else {
            upgrades.push({ tabName: key, chosenLabel: String(value), isDefault: false, priceDelta: 0 });
          }
        });
      }

      return {
        ...item,
        coreHardware,
        upgrades,
        basePlatformCost: basePrice * item.quantity,
        upgradesCost: (blueprint ? simulatedUpchargeTotal : (item.price - basePrice)) * item.quantity,
        itemTotal: item.price * item.quantity,
        blueprint,
      };
    });
  }, [cartItems, blueprints]);

  const grandTotalInvestment = useMemo(() => {
    return detailedCartItems.reduce((sum, item) => sum + item.itemTotal, 0);
  }, [detailedCartItems]);

  const totalBaseCost = useMemo(() => {
    return detailedCartItems.reduce((sum, item) => sum + item.basePlatformCost, 0);
  }, [detailedCartItems]);

  const totalUpgradesCost = useMemo(() => {
    return detailedCartItems.reduce((sum, item) => sum + item.upgradesCost, 0);
  }, [detailedCartItems]);

  if (loadingBlueprints && cartItems.length > 0) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <p className="text-sm font-medium text-slate-400">Validating multi-product workspace profiles...</p>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Cart is clear</h2>
          <p className="text-sm text-slate-400 mb-6">No customized products found inside your active tracking storage.</p>
          <button 
            type="button" 
            className="w-full rounded-xl bg-[#00241b] py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#023629]" 
            onClick={() => router.push("/products")}
          >
            BROWSE PRODUCTS
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen font-sans px-6 py-12 md:px-12">
      <div className="mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 items-start">
        
        {/* ================= LEFT GLOBAL SUMMARY RECEIPT PANEL ================= */}
        <aside className="w-full lg:sticky lg:top-24">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col gap-5">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Order Summary</h2>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Total Base Platforms</span>
              <span className="text-slate-700 font-semibold">Postal Pricing ₹{totalBaseCost.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Combined Upgrades</span>
              <span className="text-slate-700 font-semibold">+₹{totalUpgradesCost.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-end border-t border-slate-100 pt-4 mt-2">
              <span className="text-sm font-bold text-slate-800">Total Amount</span>
              <span className="font-serif text-2xl font-bold text-[#00241b] tracking-wide">
                ₹{grandTotalInvestment.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Estimated Shipping Badge Container */}
            <div className="rounded-2xl border border-slate-200 bg-[#f8fafb] p-4 mt-2 flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                ESTIMATED LOGISTICS ARRIVAL
              </span>
              <p className="text-base font-bold text-[#00241b]">4-6 Weeks Shipment</p>
              <p className="text-xs text-slate-400 font-medium">Hub: SEnSRS (IIT ROPAR)</p>
            </div>
          </div>
        </aside>

        {/* ================= RIGHT MULTI-PRODUCT SYSTEM GRID INTERFACE ================= */}
        <section className="flex flex-col gap-8">
          
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-[2.4rem] font-normal text-[#00241b] leading-tight">
              Final Review: Your Configurations ({cartItems.length})
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Verify your equipment metrics and specifications breakdown for each product before checking out.
            </p>
          </div>

          <div className="flex flex-col gap-10">
            {detailedCartItems.map((item, index) => (
              <div 
                key={`${item.id}-${index}`} 
                className={`flex flex-col gap-6 ${
                  index !== cartItems.length - 1 ? "border-b-2 border-dashed border-slate-200 pb-10" : ""
                }`}
              >
                {/* Header Sub-Row */}
                <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between w-full">
                  <div className="flex items-center gap-5">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-[100px] h-[80px] object-cover rounded-xl border border-slate-200 bg-slate-50 shrink-0" 
                    />
                    <div>
                      <h2 className="font-serif text-2xl font-normal text-[#00241b] leading-snug">
                        {item.title} <span className="font-sans text-sm text-slate-400 font-normal">({item.quantity}x unit)</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        Individual System Total: <strong className="text-slate-700 font-semibold">₹{item.itemTotal.toLocaleString("en-IN")}</strong>
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={() => removeFromCart(item.id, item.selectedCustomizations)}
                    className="text-xs font-semibold text-rose-600 hover:underline self-start sm:self-center transition-colors duration-150"
                  >
                    Remove Item
                  </button>
                </div>

                {/* Core Hardware Metrics Grid Layout */}
                <div className="flex flex-col gap-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <span>📦</span> Selected Upgrades Matrix {item.title}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {item.coreHardware.map((hw) => (
                      <div 
                        key={hw.tabName} 
                        className="flex flex-col gap-1 p-4 rounded-xl border border-slate-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.01)] relative overflow-hidden"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{hw.tabName}</span>
                        <span className="text-sm font-semibold text-slate-800 pr-16">{hw.chosenLabel}</span>
                        <span 
                          className={`absolute right-3 top-1/2 -translate-y-1/2 rounded px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase ${
                            hw.isDefault 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {hw.isDefault ? "STANDARD" : "UPGRADE"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Upgrade Modification Rows Stack */}
                <div className="flex flex-col gap-3">
                  {item.upgrades.map((upg) => (
                    <div 
                      key={upg.tabName} 
                      className="flex items-center justify-between p-4 px-6 rounded-xl border border-slate-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.01)]"
                    >
                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-sm font-semibold text-slate-800">{upg.chosenLabel}</h4>
                        <span className="text-xs text-slate-400">Subsystem modification parameter for {upg.tabName}.</span>
                      </div>
                      <span className="rounded bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                        UPGRADE
                      </span>
                    </div>
                  ))}

                  {/* Fallback Included Notification Panel */}
                  {item.upgrades.length === 0 && (
                    <div className="flex items-center justify-between p-4 px-6 rounded-xl border border-emerald-600/20 bg-emerald-50/20">
                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-sm font-semibold text-[#00241b]">Base Standard Subsystem Selection</h4>
                        <span className="text-xs text-slate-400">All components lines matching original base included.</span>
                      </div>
                      <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                        INCLUDED
                      </span>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

          {/* Action Trigger Flow Buttons Row */}
          <div className="flex flex-wrap items-center gap-4 mt-6 border-t border-slate-100 pt-8">
            <button 
              type="button" 
              onClick={() => router.push("/checkout/buy-now")}
              className="bg-[#00241b] hover:bg-[#023629] text-white px-8 py-4 text-sm font-semibold rounded-xl cursor-pointer transition-colors duration-150 flex items-center gap-2 active:scale-98 shadow-sm"
            >
              Place Order & Deposit <span>➔</span>
            </button>

            <button 
              type="button" 
              onClick={() => router.push("/checkout/book-appointment")}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-6 py-4 text-sm font-semibold rounded-xl cursor-pointer transition-colors duration-150 flex items-center gap-2 active:scale-98"
            >
              🗓️ Book an Appointment
            </button>
          </div>

        </section>
      </div>
    </main>
  );
}