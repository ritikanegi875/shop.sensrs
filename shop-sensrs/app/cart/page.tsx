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

  // State dictionary to cache blueprints for every distinct product in the cart
  const [blueprints, setBlueprints] = useState<Record<string, ProductBlueprint>>({});
  const [loadingBlueprints, setLoadingBlueprints] = useState(true);

  // Fetch missing master product blueprints dynamically for all items present in the cart
  useEffect(() => {
    async function loadAllBlueprints() {
      if (cartItems.length === 0) {
        setLoadingBlueprints(false);
        return;
      }
      try {
        const fetchPromises = cartItems.map(async (item) => {
          if (blueprints[item.id]) return null; // Already cached
          const res = await fetch(`/api/products/${item.id}`, { cache: "no-store" });
          const data = await res.json();
          return data.success && data.product ? data.product : null;
        });

        const results = await Promise.all(fetchPromises);
        const newBlueprints = { ...blueprints };
        
        results.forEach((bp) => {
          // FIXED: Switched from 'g' to 'bp' to eliminate the ReferenceError runtime crash
          if (bp !== null) {
            newBlueprints[bp._id] = bp;
          }
        });

        setBlueprints(newBlueprints);
      } catch (error) {
        console.error("MULTIPLE BLUEPRINTS FETCH ERROR:", error);
      } finally {
        setLoadingBlueprints(false);
      }
    }

    loadAllBlueprints();
  }, [cartItems]);

  // Dynamic structural analyzer processed per separate item array index
  const detailedCartItems = useMemo(() => {
    return cartItems.map((item) => {
      const blueprint = blueprints[item.id];
      const coreHardware: Array<{ tabName: string; chosenLabel: string; isDefault: boolean }> = [];
      const upgrades: Array<{ tabName: string; chosenLabel: string; isDefault: boolean; priceDelta: number }> = [];

      let simulatedUpchargeTotal = 0;
      const basePrice = blueprint ? Number(blueprint.price) : Number(item.price * 0.75);

      if (blueprint?.customizations) {
        blueprint.customizations.forEach((group) => {
          const chosenLabel = item.selectedCustomizations[group.name];
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
        Object.entries(item.selectedCustomizations).forEach(([key, value], index) => {
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

  // Grand totals calculations across all configured items
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
      <main className="configurator-container empty-cart-container">
        <p className="fallback-empty-text">Validating multi-product workspace profiles...</p>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="configurator-container empty-cart-container">
        <div className="card text-center empty-cart-card">
          <h2 className="empty-cart-title">Your Cart is clear</h2>
          <p className="empty-cart-message">No customized products found inside your active tracking storage.</p>
          <button type="button" className="btn-save-config" onClick={() => router.push("/products")}>
            BROWSE PRODUCTS
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="configurator-container">
      <div className="configurator-layout review-layout">
        
        {/* ================= LEFT GLOBAL SUMMARY RECEIPT PANEL ================= */}
        <aside className="sidebar-panel">
          <div className="card dynamic-receipt-card summary-receipt-card">
            <h2 className="summary-receipt-title">Order Summary</h2>
            
            <div className="receipt-row cost-row-top">
              <span className="row-label-muted">Total Base Platforms</span>
              <span className="row-value-medium">₹{totalBaseCost.toLocaleString("en-IN")}</span>
            </div>

            <div className="receipt-row cost-row-split">
              <span className="row-label-muted">Combined Upgrades</span>
              <span className="row-value-medium">+₹{totalUpgradesCost.toLocaleString("en-IN")}</span>
            </div>

            <div className="receipt-row total-investment-row">
              <span className="total-label-bold">Total Amount</span>
              <span className="total-grand-value">
                ₹{grandTotalInvestment.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Global Lead Time Module Display */}
            <div className="card transport-metadata-banner" style={{ background: "#f8fafb", padding: "12px", border: "1px solid #e2e8f0", marginTop: "1rem" }}>
              <span className="transport-tagline" style={{ display: "block", fontSize: "0.65rem", fontWeight: "700" }}>
                ESTIMATED LOGISTICS ARRIVAL
              </span>
              <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#00241b", marginTop: "0.25rem" }}>4-6 Weeks Shipment</p>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.15rem" }}>Hub: SEnSRS (IIT ROPAR)</p>
            </div>
          </div>
        </aside>

        {/* ================= RIGHT MULTI-PRODUCT SYSTEM GRID INTERFACE ================= */}
        <section className="main-configurator-panel layout-content-stack">
          
          <div className="review-header-intro">
            <h1 className="review-page-title">Final Review: Your Configurations ({cartItems.length})</h1>
            <p className="review-page-subtitle">
              Verify your equipment metrics and specifications breakdown for each product before checking out.
            </p>
          </div>

          {/* Maps through every individual configured product inside the basket cleanly */}
          {detailedCartItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="cart-product-workspace-card" style={{ borderBottom: index !== cartItems.length - 1 ? "2px dashed #e2e8f0" : "none", paddingBottom: "2.5rem", marginBottom: "1.5rem" }}>
              
              {/* Product Header Row Summary */}
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "1.5rem" }}>
                <img src={item.image} alt={item.title} style={{ width: "100px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
                <div>
                  <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.6rem", color: "#00241b", margin: 0 }}>
                    {item.title} <span style={{ fontSize: "1rem", color: "#64748b", fontFamily: "sans-serif" }}>({item.quantity}x unit)</span>
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.2rem" }}>Individual System Total: <strong>₹{item.itemTotal.toLocaleString("en-IN")}</strong></p>
                </div>
                <button 
                  type="button" 
                  className="btn-clear-profile" 
                  style={{ marginLeft: "auto", width: "auto", marginTop: 0 }}
                  onClick={() => removeFromCart(item.id, item.selectedCustomizations)}
                >
                  Remove Item
                </button>
              </div>

              {/* Core Hardware Sub-grid matching the active system index context layout */}
              <div className="hardware-section-block" style={{ marginBottom: "1.5rem" }}>
                <div className="section-title-header" style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>
                  📦 Selected Upgrades Matrix {item.title}
                </div>
                <div className="hardware-cards-grid">
                  {item.coreHardware.map((hw) => (
                    <div key={hw.tabName} className="card hardware-metric-card" style={{ padding: "1rem" }}>
                      <span className="hardware-metric-tag">{hw.tabName}</span>
                      <span className="hardware-metric-name" style={{ fontSize: "0.95rem" }}>{hw.chosenLabel}</span>
                      <span className={`hardware-system-badge ${hw.isDefault ? "standard-badge" : "upgrade-badge"}`}>
                        {hw.isDefault ? "STANDARD" : "UPGRADE"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upgrades checklist mapping list context linked directly to item configuration properties */}
              <div className="upgrades-section-block">
                <div className="upgrades-cards-stack">
                  {item.upgrades.map((upg) => (
                    <div key={upg.tabName} className={`card upgrade-item-row-card ${upg.isDefault ? "static-included-card" : ""}`} style={{ padding: "1rem 1.5rem" }}>
                      <div className="upgrade-meta-content">
                        <h4 className="upgrade-title-text" style={{ fontSize: "0.95rem" }}>{upg.chosenLabel}</h4>
                        <span className="upgrade-description-sub" style={{ fontSize: "0.75rem" }}>Subsystem modification parameter for {upg.tabName}.</span>
                      </div>
                      <span className={`upgrade-tier-pill ${upg.isDefault ? "success-pill" : ""}`} style={{ fontSize: "0.75rem" }}>
                        {upg.isDefault ? "INCLUDED" : "UPGRADE"}
                      </span>
                    </div>
                  ))}
                  {item.upgrades.length === 0 && (
                    <div className="card upgrade-item-row-card static-included-card" style={{ padding: "1rem 1.5rem" }}>
                      <div className="upgrade-meta-content">
                        <h4 className="upgrade-title-text" style={{ fontSize: "0.95rem" }}>Base Standard Subsystem Selection</h4>
                        <span className="upgrade-description-sub" style={{ fontSize: "0.75rem" }}>All components lines matching original base included.</span>
                      </div>
                      <span className="upgrade-tier-pill success-pill" style={{ fontSize: "0.75rem" }}>INCLUDED</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}

          {/* Action Trigger Buttons Footer Nav */}
          <div className="review-action-footer-row" style={{ marginTop: "2rem" }}>
            <button 
              type="button" 
              className="btn-save-config footer-checkout-btn" 
              onClick={() => router.push("/checkout/buy-now")}
            >
              Place Order & Deposit <span>➔</span>
            </button>

            <button 
              type="button" 
              className="btn-appointment-redirect"
              onClick={() => router.push("/checkout/book-appointment")}
            >
              🗓️ Book an Appointment
            </button>
          </div>

        </section>
      </div>
    </main>
  );
}