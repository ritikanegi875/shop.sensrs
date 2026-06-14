"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

type CustomizationOption = {
  _id?: string;
  label: string;
  price: number;
  isDefault: boolean;
  // Generic values mapped to the database data strings
  spec1?: string;
  spec2?: string;
  spec3?: string;
};

type CustomizationGroup = {
  _id?: string;
  name: string; // Dynamic Tab Name configured by admin (e.g., "Motor", "Battery")
  type: "single";
  description?: string; // New property to capture independent tab descriptions from admin
  specLabels?: {
    label1: string; // Dynamic label for column 1
    label2: string; // Dynamic label for column 2
    label3: string; // Dynamic label for column 3
  };
  options: CustomizationOption[];
};

type Product = {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  description: string;
  hasCustomization?: boolean;
  customizations?: CustomizationGroup[];
};

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Tracks chosen items: { "Motor": "Torque Motor", "Battery": "15V Standard" }
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  // Active Tab navigation state (matches group names)
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!data.success || !data.product) {
          router.push("/products");
          return;
        }

        const fetchedProduct = data.product as Product;
        setProduct(fetchedProduct);

        if (fetchedProduct.hasCustomization && fetchedProduct.customizations?.length) {
          const defaults: Record<string, string> = {};
          fetchedProduct.customizations.forEach((group) => {
            const defaultOption = group.options.find((opt) => opt.isDefault) || group.options[0];
            if (defaultOption) {
              defaults[group.name] = defaultOption.label;
            }
          });
          setSelectedOptions(defaults);
          // Set initial tab to the first customization group name dynamically
          setActiveTab(fetchedProduct.customizations[0].name);
        }
      } catch (error) {
        console.error("PRODUCT DETAIL ERROR:", error);
        router.push("/products");
      } finally {
        setLoading(false);
      }
    }

    if (params?.id) {
      fetchProduct();
    }
  }, [params?.id, router]);

  // Derived current step configuration details for the sidebar summary block
  const selectedConfigBreakdown = useMemo(() => {
    if (!product || !product.customizations) return [];
    return product.customizations.map((group) => {
      const selectedLabel = selectedOptions[group.name];
      const foundOption = group.options.find((o) => o.label === selectedLabel);
      return {
        groupName: group.name,
        label: selectedLabel || "Not Selected",
        price: foundOption ? foundOption.price : 0,
      };
    });
  }, [product, selectedOptions]);

  // Running grand total calculation
  const finalPrice = useMemo(() => {
    if (!product) return 0;
    let total = Number(product.price) || 0;
    selectedConfigBreakdown.forEach((item) => {
      total += item.price;
    });
    return total;
  }, [product, selectedConfigBreakdown]);

  // Find index properties to power tab pagination flows
  const groupsList = product?.customizations || [];
  const currentGroupIndex = groupsList.findIndex((g) => g.name === activeTab);
  const activeGroupData = groupsList[currentGroupIndex];

  const handleNextStep = () => {
    if (currentGroupIndex < groupsList.length - 1) {
      setActiveTab(groupsList[currentGroupIndex + 1].name);
    }
  };

  const handleSelectOption = (groupName: string, optionLabel: string) => {
    setSelectedOptions((prev) => ({ ...prev, [groupName]: optionLabel }));
  };

  // MODIFIED: Replaced the standard alert overlay with a router navigation dispatch mechanism
  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product._id,
      title: product.title,
      price: finalPrice,
      image: product.image,
      selectedCustomizations: selectedOptions,
    });

    // Pushes the user state seamlessly into your cart layout page path route
    router.push("/cart");
  };

  if (loading) return <p className="configurator-loader">Loading configuration system...</p>;
  if (!product) return <p className="configurator-loader">Product configuration unavailable.</p>;

  return (
    <main className="configurator-container">
      <div className="configurator-layout">
        
        {/* ================= LEFT SIDEBAR PANEL ================= */}
        <aside className="sidebar-panel">
          {/* Product Hero Snapshot Card */}
          <div className="card product-hero-card">
            <div className="image-wrapper">
              <img src={product.image} alt={product.title} />
            </div>
            <div className="hero-details">
              <span className="badge">{product.category || "Configurable"}</span>
              <h1 className="product-title">{product.title}</h1>
            </div>
          </div>

          {/* Dynamic Configuration Receipt Block */}
          <div className="card dynamic-receipt-card">
            <h2>Your Configuration</h2>
            
            <div className="receipt-row base-row">
              <span>Base Platform</span>
              <span className="price-value">₹{Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="receipt-breakdown-list">
              {selectedConfigBreakdown.map((item, index) => (
                <div key={index} className="receipt-row custom-item-row">
                  <div className="item-meta">
                    <span className="item-label">{item.label}</span>
                    <span className="item-sub">{item.groupName}</span>
                  </div>
                  <span className="price-delta">
                    {item.price === 0 ? "Included" : `+₹${item.price.toLocaleString("en-IN")}`}
                  </span>
                </div>
              ))}
            </div>

            <div className="receipt-total-section">
              <div className="total-meta">
                <span>EST. INVESTMENT</span>
                <p className="grand-total">₹{finalPrice.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <button type="button" className="btn-save-config" onClick={handleAddToCart}>
              SAVE CONFIGURATION
            </button>
          </div>
        </aside>

        {/* ================= RIGHT CONFIGURATOR INTERFACE ================= */}
        <section className="main-configurator-panel">
          {/* Multi-step Header Navigation Tabs */}
          <nav className="configurator-tabs-nav">
            {groupsList.map((group) => (
              <button
                key={group.name}
                type="button"
                className={`tab-link ${activeTab === group.name ? "active" : ""}`}
                onClick={() => setActiveTab(group.name)}
              >
                {group.name.toUpperCase()}
              </button>
            ))}
            {/* Added extra static luxury design placeholders visible in image mockup tabs
            <button type="button" className="tab-link disabled">LIGHTS</button>
            <button type="button" className="tab-link disabled">ADVANCED</button> */}
          </nav>

          {/* Tab Content Display Area */}
          <div className="tab-content-viewport">
            <div className="step-introduction">
              {/* FIXED: Displays the clean customized Tab Name dynamically saved from the Admin panel */}
              <h2 className="step-title">
                {activeGroupData?.name}
              </h2>
              {/* FIXED: Switched hardcoded fallback descriptions to use your custom backend description string dynamically per tab */}
              <p className="step-description">
                {activeGroupData?.description || "Select system parameters for this integrated subsystem array."}
              </p>
            </div>

            {/* List Selection Options Wrapper */}
            <div className="options-selection-stack">
              {activeGroupData?.options.map((option, idx) => {
                const isSelected = selectedOptions[activeGroupData.name] === option.label;
                return (
                  <div
                    key={idx}
                    className={`option-selection-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectOption(activeGroupData.name, option.label)}
                  >
                    <div className="option-card-header">
                      <h3 className="option-name">{option.label}</h3>
                      <span className="option-cost-tier">
                        {option.price === 0 ? "Included" : `+₹${option.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                      </span>
                    </div>

                    {/* Specifications Metrics Sub-Grid - Pulls labels independently from each group's unique specLabels */}
                    <div className="option-specs-grid">
                      <div className="spec-metric-box">
                        <span className="metric-title">
                          {activeGroupData?.specLabels?.label1 || "SPEC 1"}
                        </span>
                        <span className="metric-value">{option.spec1 || "N/A"}</span>
                      </div>
                      <div className="spec-metric-box">
                        <span className="metric-title">
                          {activeGroupData?.specLabels?.label2 || "SPEC 2"}
                        </span>
                        <span className="metric-value">{option.spec2 || "N/A"}</span>
                      </div>
                      <div className="spec-metric-box">
                        <span className="metric-title">
                          {activeGroupData?.specLabels?.label3 || "SPEC 3"}
                        </span>
                        <span className="metric-value">{option.spec3 || "N/A"}</span>
                      </div>
                    </div>

                    {/* Visual Custom Native Radio Selection Target */}
                    <div className="custom-radio-wrapper">
                      <div className={`radio-circle ${isSelected ? "checked" : ""}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step Action Button Group */}
            <div className="step-navigation-footer">
              {currentGroupIndex < groupsList.length - 1 ? (
                <button type="button" className="btn-next-step" onClick={handleNextStep}>
                  NEXT: {groupsList[currentGroupIndex + 1].name.toUpperCase()}
                </button>
              ) : (
                <button type="button" className="btn-next-step finish" onClick={handleAddToCart}>
                  COMPLETE CONFIGURATION
                </button>
              )}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}