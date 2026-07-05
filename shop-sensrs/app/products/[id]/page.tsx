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
  spec1?: string;
  spec2?: string;
  spec3?: string;
};

type CustomizationGroup = {
  _id?: string;
  name: string;
  type: "single";
  description?: string;
  specLabels?: {
    label1: string;
    label2: string;
    label3: string;
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
  
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
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

  const finalPrice = useMemo(() => {
    if (!product) return 0;
    let total = Number(product.price) || 0;
    selectedConfigBreakdown.forEach((item) => {
      total += item.price;
    });
    return total;
  }, [product, selectedConfigBreakdown]);

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

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product._id,
      title: product.title,
      price: finalPrice,
      image: product.image,
      selectedCustomizations: selectedOptions,
    });

    router.push("/cart");
  };

  if (loading) return <p className="text-center text-slate-400 font-medium py-16">Loading configuration system...</p>;
  if (!product) return <p className="text-center text-slate-400 font-medium py-16">Product configuration unavailable.</p>;

  return (
    <main className="bg-slate-50 min-h-screen px-6 py-12 md:px-12 font-sans text-slate-800">
      <div className="mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 items-start">
        
        {/* ================= LEFT SIDEBAR CONFIG PANEL ================= */}
        <aside className="flex flex-col gap-6 w-full lg:sticky lg:top-24">
          
          {/* Product Hero Snapshot Card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex flex-col gap-4">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-50 relative">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            </div>
            <div className="px-2 pb-2">
              <span className="inline-block bg-[#fdf3e7] text-[#c07c34] text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded mb-2">
                {product.category || "Configurable"}
              </span>
              <h1 className="font-serif text-2xl font-normal text-[#00241b] leading-tight m-0">{product.title}</h1>
            </div>
          </div>

          {/* Dynamic Configuration Receipt Block */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex flex-col gap-5">
            <h2 className="text-lg font-bold text-slate-800 m-0">Your Configuration</h2>
            
            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
              <span className="text-slate-800 font-semibold">Base Platform</span>
              <span className="text-slate-700 font-medium">₹{Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
              {selectedConfigBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-start text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-800 font-medium">{item.label}</span>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">{item.groupName}</span>
                  </div>
                  <span className="text-slate-500 font-medium shrink-0 text-right">
                    {item.price === 0 ? "Included" : `+₹${item.price.toLocaleString("en-IN")}`}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1">
                EST. INVESTMENT
              </span>
              <p className="font-serif text-[2rem] font-bold text-[#00241b] m-0 tracking-wide">
                ₹{finalPrice.toLocaleString("en-IN")}
              </p>
            </div>

            <button 
              type="button" 
              onClick={handleAddToCart}
              className="w-full rounded-xl bg-[#00241b] py-3.5 text-center text-sm font-semibold text-white tracking-wide transition-colors duration-150 hover:bg-[#023629] active:scale-98 shadow-sm"
            >
              SAVE CONFIGURATION
            </button>
          </div>
        </aside>

        {/* ================= RIGHT CONFIGURATOR WORKSPACE ================= */}
        <section className="w-full flex flex-col gap-6">
          
          {/* Multi-step Navigation Header Sub-Tabs */}
          <nav className="flex w-full items-center bg-slate-100 rounded-xl p-1 overflow-x-auto gap-1">
            {groupsList.map((group) => (
              <button
                key={group.name}
                type="button"
                onClick={() => setActiveTab(group.name)}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold tracking-wider rounded-lg border-none cursor-pointer transition-all duration-150 uppercase ${
                  activeTab === group.name 
                    ? "bg-white text-[#00241b] shadow-sm" 
                    : "text-slate-400 hover:text-slate-600 bg-transparent"
                }`}
              >
                {group.name}
              </button>
            ))}
          </nav>

          {/* Core Selection Display Grid Area */}
          <div className="w-full bg-transparent flex flex-col gap-6">
            
            <div className="flex flex-col gap-1 mt-2">
              <h2 className="font-serif text-[2.4rem] font-normal text-[#00241b] uppercase m-0 tracking-wide">
                {activeGroupData?.name}
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                {activeGroupData?.description || "Select system parameters for this integrated subsystem array."}
              </p>
            </div>

            {/* Selection Options Grid Matrix Stack */}
            <div className="flex flex-col gap-4">
              {activeGroupData?.options.map((option, idx) => {
                const isSelected = selectedOptions[activeGroupData.name] === option.label;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(activeGroupData.name, option.label)}
                    className={`group relative border rounded-2xl bg-white p-5 pr-16 flex flex-col gap-4 cursor-pointer select-none transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.005)] ${
                      isSelected 
                        ? "border-[#00241b] ring-1 ring-[#00241b]" 
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Header Row Content */}
                    <div className="flex justify-between items-start w-full">
                      <h3 className="font-serif text-xl font-normal text-slate-800 m-0">{option.label}</h3>
                      <span className="text-sm font-semibold text-slate-700 shrink-0">
                        {option.price === 0 ? "Included" : `+₹${option.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                      </span>
                    </div>

                    {/* Specifications Column Matrix Sub-Grid */}
                    <div className="grid grid-cols-3 gap-6 max-w-[450px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          {activeGroupData?.specLabels?.label1 || "SPEC 1"}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{option.spec1 || "N/A"}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          {activeGroupData?.specLabels?.label2 || "SPEC 2"}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{option.spec2 || "N/A"}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          {activeGroupData?.specLabels?.label3 || "SPEC 3"}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{option.spec3 || "N/A"}</span>
                      </div>
                    </div>

                    {/* Floating Absolute Interactive Custom Radio Circle Elements */}
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      <div className={`w-[1.2rem] h-[1.2rem] border border-slate-300 rounded-full flex items-center justify-center bg-white transition-all duration-150 ${
                        isSelected ? "border-[#00241b] border-[5px]" : "group-hover:border-slate-400"
                      }`} />
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Stepper Navigation Footer Buttons Layout */}
            <div className="flex justify-end mt-4">
              {currentGroupIndex < groupsList.length - 1 ? (
                <button 
                  type="button" 
                  onClick={handleNextStep}
                  className="bg-[#00241b] hover:bg-[#023629] text-white px-8 py-3.5 text-xs font-bold tracking-wider rounded-xl cursor-pointer transition-colors duration-150 active:scale-98 shadow-sm uppercase"
                >
                  NEXT: {groupsList[currentGroupIndex + 1].name}
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={handleAddToCart}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3.5 text-xs font-bold tracking-wider rounded-xl cursor-pointer transition-colors duration-150 active:scale-98 shadow-sm uppercase"
                >
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