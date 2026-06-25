"use client";

import { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  Eye, 
  Layers, 
  Plus, 
  Filter, 
  Download, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

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
  description?: string;
  specLabels: {
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
  sku?: string;
  createdAt?: string;
  hasCustomization?: boolean;
  customizations?: CustomizationGroup[];
};

const emptyGroup = (): CustomizationGroup => ({
  name: "",
  type: "single",
  description: "", 
  specLabels: {
    label1: "", 
    label2: "", 
    label3: "", 
  },
  options: [
    { label: "", price: 0, isDefault: true, spec1: "", spec2: "", spec3: "" },
    { label: "", price: 0, isDefault: false, spec1: "", spec2: "", spec3: "" },
  ],
});

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");

  const [hasCustomization, setHasCustomization] = useState(false);
  const [customizations, setCustomizations] = useState<CustomizationGroup[]>([]);

  const totalCount = products.length;

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        const processedProducts = (data.products || []).map((p: any) => ({
          ...p,
          sku: p.sku || `SKU-${p._id?.slice(-6).toUpperCase() || "GENERIC"}`,
          createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-GB") + ", " + new Date(p.createdAt).toLocaleTimeString("en-US", {hour: '2-digit', minute:'2-digit'}) : "14/06/2026, 10:30 AM"
        }));
        setProducts(processedProducts);
      }
    } catch (error) {
      console.error("FETCH PRODUCTS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setPrice(0);
    setImage("");
    setImageFile(null);
    setCategory("");
    setDescription("");
    setSku("");
    setHasCustomization(false);
    setCustomizations([]);
  };

  const uploadImageToCloudinary = async () => {
    if (!imageFile) return image;
    const formData = new FormData();
    formData.append("file", imageFile);
    setUploadingImage(true);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Image upload failed");
      return data.imageUrl || data.url;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddGroup = () => {
    setCustomizations((prev) => [...prev, emptyGroup()]);
  };

  const handleRemoveGroup = (groupIndex: number) => {
    setCustomizations((prev) => prev.filter((_, index) => index !== groupIndex));
  };

  const handleGroupNameChange = (groupIndex: number, value: string) => {
    setCustomizations((prev) =>
      prev.map((group, index) =>
        index === groupIndex ? { ...group, name: value } : group
      )
    );
  };

  const handleGroupDescriptionChange = (groupIndex: number, value: string) => {
    setCustomizations((prev) =>
      prev.map((group, index) =>
        index === groupIndex ? { ...group, description: value } : group
      )
    );
  };

  const handleSpecLabelChange = (groupIndex: number, labelKey: "label1" | "label2" | "label3", value: string) => {
    setCustomizations((prev) =>
      prev.map((group, index) =>
        index === groupIndex
          ? { ...group, specLabels: { ...group.specLabels, [labelKey]: value } }
          : group
      )
    );
  };

  const handleAddOption = (groupIndex: number) => {
    setCustomizations((prev) =>
      prev.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              options: [
                ...group.options,
                { label: "", price: 0, isDefault: group.options.length === 0, spec1: "", spec2: "", spec3: "" },
              ],
            }
          : group
      )
    );
  };

  const handleRemoveOption = (groupIndex: number, optionIndex: number) => {
    setCustomizations((prev) =>
      prev.map((group, index) => {
        if (index !== groupIndex) return group;
        const updatedOptions = group.options.filter((_, idx) => idx !== optionIndex);

        if (updatedOptions.length > 0 && !updatedOptions.some((opt) => opt.isDefault)) {
          let lowestIndex = 0;
          for (let i = 1; i < updatedOptions.length; i++) {
            if (updatedOptions[i].price < updatedOptions[lowestIndex].price) {
              lowestIndex = i;
            }
          }
          updatedOptions[lowestIndex].isDefault = true;
        }
        return { ...group, options: updatedOptions };
      })
    );
  };

  const handleOptionChange = (
    groupIndex: number,
    optionIndex: number,
    field: "label" | "price" | "spec1" | "spec2" | "spec3",
    value: string | number
  ) => {
    setCustomizations((prev) =>
      prev.map((group, gIndex) => {
        if (gIndex !== groupIndex) return group;
        const updatedOptions = group.options.map((option, oIndex) =>
          oIndex === optionIndex
            ? { ...option, [field]: field === "price" ? Number(value) : value }
            : option
        );
        return { ...group, options: updatedOptions };
      })
    );
  };

  const handleSetDefaultOption = (groupIndex: number, optionIndex: number) => {
    setCustomizations((prev) =>
      prev.map((group, gIndex) => {
        if (gIndex !== groupIndex) return group;
        return {
          ...group,
          options: group.options.map((option, oIndex) => ({
            ...option,
            isDefault: oIndex === optionIndex,
          })),
        };
      })
    );
  };

  const normalizeCustomizations = (groups: CustomizationGroup[]): CustomizationGroup[] => {
    const validGroups: CustomizationGroup[] = [];
    groups.forEach((group) => {
      if (!group.name || group.name.trim() === "") return;

      const validOptions = group.options.filter((option) => option.label && option.label.trim() !== "");
      if (validOptions.length === 0) return;

      let normalizedOptions = validOptions.map((option) => ({
        label: option.label.trim(),
        price: Number(option.price) || 0,
        isDefault: !!option.isDefault,
        spec1: option.spec1?.trim() || "",
        spec2: option.spec2?.trim() || "",
        spec3: option.spec3?.trim() || "",
      }));

      if (!normalizedOptions.some((option) => option.isDefault)) {
        let lowestIndex = 0;
        for (let i = 1; i < normalizedOptions.length; i++) {
          if (normalizedOptions[i].price < normalizedOptions[lowestIndex].price) {
            lowestIndex = i;
          }
        }
        normalizedOptions = normalizedOptions.map((option, index) => ({
          ...option,
          isDefault: index === lowestIndex,
        }));
      }

      validGroups.push({
        name: group.name.trim(),
        type: "single",
        description: group.description?.trim() || "",
        specLabels: {
          label1: group.specLabels?.label1?.trim() || "Spec 1",
          label2: group.specLabels?.label2?.trim() || "Spec 2",
          label3: group.specLabels?.label3?.trim() || "Spec 3",
        },
        options: normalizedOptions,
      });
    });

    return validGroups;
  };

  const handleSubmit = async () => {
    if (!title || !price || (!image && !imageFile) || !category) {
      alert("Please fill all required product fields");
      return;
    }

    const normalizedCustomizations = hasCustomization ? normalizeCustomizations(customizations) : [];

    try {
      let finalImage = image;
      if (imageFile) {
        finalImage = await uploadImageToCloudinary();
      }

      if (!finalImage) {
        alert("Image upload failed");
        return;
      }

      const payload = {
        title,
        price,
        image: finalImage,
        category,
        description,
        sku,
        hasCustomization,
        customizations: normalizedCustomizations,
      };

      const res = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingId ? "Product updated successfully" : "Product added successfully");
        resetForm();
        fetchProducts();
      } else {
        alert(data.message || "Failed to save product");
      }
    } catch (error) {
      console.error("SAVE PRODUCT ERROR:", error);
      alert("Something went wrong");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setTitle(product.title);
    setPrice(product.price);
    setImage(product.image);
    setImageFile(null);
    setCategory(product.category);
    setDescription(product.description || "");
    setSku(product.sku || "");
    setHasCustomization(!!product.hasCustomization);
    
    const loadedCustomizations = (product.customizations || []).map(g => ({
      ...g,
      description: g.description || "",
      specLabels: g.specLabels ? {
        label1: g.specLabels.label1 || "",
        label2: g.specLabels.label2 || "",
        label3: g.specLabels.label3 || ""
      } : { 
        label1: "", 
        label2: "", 
        label3: "" 
      }
    }));
    setCustomizations(loadedCustomizations);
    window.scrollTo({ top: document.getElementById('product-form-anchor')?.offsetTop, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item permanently?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Product deleted successfully");
        fetchProducts();
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("DELETE PRODUCT ERROR:", error);
      alert("Something went wrong");
    }
  };

  return (
    <section className="admin-products-page" style={{ padding: "32px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      {/* GLOBAL MATRIX COMPONENT CORE STYLES */}
      <style dangerouslySetInnerHTML={{__html: `
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-size: 0.875rem; font-weight: 600; color: #334155; }
        .form-group input[type="text"], .form-group input[type="number"], .form-group select, .form-group textarea { padding: 0.65rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; width: 100%; box-sizing: border-box; outline: none; }
        .customization-toggle { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none; }
        .customization-toggle input { width: 1.15rem; height: 1.15rem; cursor: pointer; }
        .customization-builder { border-top: 2px dashed #e2e8f0; padding-top: 2rem; margin-top: 0.5rem; }
        .customization-builder-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .customization-builder-head h2 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
        .primary-btn { background: #0284c7; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
        .secondary-btn { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; margin-top: 0.5rem; width: 100%; }
        .delete-btn { background: #ef4444; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
        .customization-group-card { background: #fff; border: 1px solid #cbd5e1; padding: 1.5rem; margin-bottom: 1.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 1.25rem; box-shadow: 0 1px 3px rgb(0 0 0 / 0.05); }
        .customization-group-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem; }
        .customization-group-head h3 { font-size: 1.05rem; font-weight: 700; color: #334155; margin: 0; }
        .spec-label-customizer-row { display: flex; gap: 1rem; background: #f8fafc; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; }
        .customization-option-row-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; padding-bottom: 1.25rem; margin-bottom: 1.25rem; border-bottom: 1px dashed #e2e8f0; background: #fafafa; padding: 1rem; border-radius: 6px; align-items: flex-end; }
        .option-default-box { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 60px; }
        .option-default-box input { width: 1.15rem; height: 1.15rem; cursor: pointer; margin-top: 0.5rem; }
      `}} />

      {/* DASHBOARD TOP HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" }}>Products</h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Manage all product listings in your store.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #e2e8f0", backgroundColor: "#fff", padding: "8px 16px", borderRadius: "6px", fontSize: "14px", fontWeight: "500", color: "#334155", cursor: "pointer" }}><Filter size={16} /> Filter</button>
          <button style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #e2e8f0", backgroundColor: "#fff", padding: "8px 16px", borderRadius: "6px", fontSize: "14px", fontWeight: "500", color: "#334155", cursor: "pointer" }}><Download size={16} /> Export</button>
          <button onClick={() => window.scrollTo({ top: document.getElementById('product-form-anchor')?.offsetTop, behavior: 'smooth' })} style={{ display: "flex", alignItems: "center", gap: "6px", border: "none", backgroundColor: "#14532d", color: "#fff", padding: "8px 16px", borderRadius: "6px", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}><Plus size={16} /> Add Product</button>
        </div>
      </div>

      {/* METRIC OVERVIEW GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", marginBottom: "32px" }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}><ShoppingBag size={22} /></div>
          <div><span style={{ fontSize: "13px", fontWeight: "500", color: "#64748b" }}>Total Catalog Products</span><h3 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "4px 0 2px 0" }}>{totalCount}</h3><span style={{ fontSize: "12px", color: "#16a34a" }}></span></div>
        </div>
      </div>

      {/* COMPACT INTERFACE DATA TABLE */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: "40px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: "600" }}>
              {/* <th style={{ padding: "16px 20px", width: "40px" }}><input type="checkbox" /></th> */}
              <th style={{ padding: "16px 20px" }}>Product</th>
              <th style={{ padding: "16px 20px" }}>Category</th>
              <th style={{ padding: "16px 20px" }}>Price</th>
              <th style={{ padding: "16px 20px" }}>Created At</th>
              <th style={{ padding: "16px 20px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>Loading products dataset...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>No active products cataloged.</td></tr>
            ) : (
              products.map((product) => {
                return (
                  <tr key={product._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    {/* <td style={{ padding: "14px 20px" }}><input type="checkbox" /></td> */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <img src={product.image} alt="" style={{ width: "44px", height: "44px", objectFit: "contain", borderRadius: "6px", backgroundColor: "#fafafa", border: "1px solid #f1f5f9" }} />
                        <div>
                          <div style={{ fontWeight: "600", color: "#1e293b" }}>{product.title}</div>
                          <div style={{ fontSize: "12px", color: "#94a3b8" }}>SKU: {product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", color: "#475569" }}>{product.category}</td>
                    <td style={{ padding: "14px 20px", fontWeight: "600" }}>₹{product.price.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "14px 20px", color: "#64748b" }}>{product.createdAt}</td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", color: "#94a3b8" }}>
                        <button style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }} onClick={() => handleEdit(product)}><Edit3 size={17} /></button>
                        <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} onClick={() => handleDelete(product._id)}><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff" }}>
          <span style={{ fontSize: "13px", color: "#64748b" }}>Showing 1 to {products.length} of {products.length} products</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button style={{ border: "1px solid #e2e8f0", backgroundColor: "#fff", padding: "6px", borderRadius: "6px" }} disabled><ChevronLeft size={16} /></button>
            <button style={{ border: "none", backgroundColor: "#e0f2fe", color: "#0369a1", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>1</button>
            <button style={{ border: "1px solid #e2e8f0", backgroundColor: "#fff", padding: "6px", borderRadius: "6px" }}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "40px 0" }} />

      {/* CORE PRODUCT MANAGEMENT INTERFACE FORM WORKBENCH */}
      <div id="product-form-anchor" style={{ background: "white", border: "1px solid #e2e8f0", padding: "32px", borderRadius: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
            {editingId ? "Modify Product Details" : "Add Product"}
          </h2>
          {editingId && (
            <button style={{ background: "#64748b", color: "white", border: "none", padding: "0.6rem 1.2rem", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }} type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
          <div className="form-group">
            <label>Product Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter product title" />
          </div>

          <div className="form-group">
            <label>Base Price</label>
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Enter base price" />
          </div>

          <div className="form-group full-width">
            <label>Category</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Enter category" />
          </div>

          <div className="form-group full-width">
            <label>Upload Product Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
            {image && !imageFile && (
              <div style={{ marginTop: "8px" }}>
                <img src={image} alt="Preview" style={{ width: "80px", height: "70px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
              </div>
            )}
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter product description" />
          </div>

          <div className="form-group full-width">
            <label className="customization-toggle">
              <input
                type="checkbox"
                checked={hasCustomization}
                onChange={(e) => {
                  setHasCustomization(e.target.checked);
                  if (e.target.checked && customizations.length === 0) {
                    setCustomizations([emptyGroup()]);
                  }
                  if (!e.target.checked) {
                    setCustomizations([]);
                  }
                }}
              />
              <span>Enable Product Customization</span>
            </label>
          </div>
        </div>

        {/* WORKSTATION VISUAL PARAMETER OPTION CARDS TABS BLOCK CONFIGURATOR */}
        {hasCustomization && (
          <div className="full-width customization-builder">
            <div className="customization-builder-head">
              <h2>Customization Groups / Configurator Tabs</h2>
              <button type="button" className="primary-btn" onClick={handleAddGroup}>
                Add Tab Group
              </button>
            </div>

            {customizations.length === 0 ? (
              <p style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>No customization tabs added yet.</p>
            ) : (
              <div className="customization-groups">
                {customizations.map((group, groupIndex) => (
                  <div className="customization-group-card" key={groupIndex}>
                    <div className="customization-group-head">
                      <h3>Tab #{groupIndex + 1}</h3>
                      <button type="button" className="delete-btn" onClick={() => handleRemoveGroup(groupIndex)}>
                        Remove Tab Group
                      </button>
                    </div>

                    <div className="form-group">
                      <label>Tab / Group Name</label>
                      <input
                        type="text"
                        value={group.name}
                        onChange={(e) => handleGroupNameChange(groupIndex, e.target.value)}
                        placeholder="Example: Motor, Battery, Controller, Lights, etc."
                      />
                    </div>

                    <div className="form-group">
                      <label>Tab Introduction Description Summary</label>
                      <textarea
                        rows={2}
                        value={group.description || ""}
                        onChange={(e) => handleGroupDescriptionChange(groupIndex, e.target.value)}
                        placeholder="Example: Select engineering parameters for your integrated battery arrays."
                      />
                    </div>

                    <div className="spec-label-customizer-row">
                      <div className="form-group" style={{ flex: "1" }}>
                        <label style={{ color: "#475569", fontWeight: "600" }}>Column 1 Label Text</label>
                        <input 
                          type="text" 
                          value={group.specLabels?.label1 || ""} 
                          onChange={(e) => handleSpecLabelChange(groupIndex, "label1", e.target.value)} 
                          placeholder="e.g., POWER Spec"
                        />
                      </div>
                      <div className="form-group" style={{ flex: "1" }}>
                        <label style={{ color: "#475569", fontWeight: "600" }}>Column 2 Label Text</label>
                        <input 
                          type="text" 
                          value={group.specLabels?.label2 || ""} 
                          onChange={(e) => handleSpecLabelChange(groupIndex, "label2", e.target.value)} 
                          placeholder="e.g., RUNTIME Spec"
                        />
                      </div>
                      <div className="form-group" style={{ flex: "1" }}>
                        <label style={{ color: "#475569", fontWeight: "600" }}>Column 3 Label Text</label>
                        <input 
                          type="text" 
                          value={group.specLabels?.label3 || ""} 
                          onChange={(e) => handleSpecLabelChange(groupIndex, "label3", e.target.value)} 
                          placeholder="e.g., THRUST Spec"
                        />
                      </div>
                    </div>

                    <div className="customization-options">
                      {group.options.map((option, optionIndex) => (
                        <div className="customization-option-row-grid" key={optionIndex}>
                          
                          <div className="form-group" style={{ flex: "1 1 180px" }}>
                            <label>Option Card Title</label>
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) => handleOptionChange(groupIndex, optionIndex, "label", e.target.value)}
                              placeholder="Example: Cruise Motor"
                            />
                          </div>

                          <div className="form-group" style={{ flex: "1 1 110px" }}>
                            <label>Upcharge Price (₹)</label>
                            <input
                              type="number"
                              value={option.price}
                              onChange={(e) => handleOptionChange(groupIndex, optionIndex, "price", e.target.value)}
                              placeholder="0 for Included"
                            />
                          </div>

                          <div className="form-group" style={{ flex: "1 1 100px" }}>
                            <label>{group.specLabels?.label1 || "Spec 1"}</label>
                            <input
                              type="text"
                              value={option.spec1 || ""}
                              onChange={(e) => handleOptionChange(groupIndex, optionIndex, "spec1", e.target.value)}
                              placeholder="Value..."
                            />
                          </div>

                          <div className="form-group" style={{ flex: "1 1 100px" }}>
                            <label>{group.specLabels?.label2 || "Spec 2"}</label>
                            <input
                              type="text"
                              value={option.spec2 || ""}
                              onChange={(e) => handleOptionChange(groupIndex, optionIndex, "spec2", e.target.value)}
                              placeholder="Value..."
                            />
                          </div>

                          <div className="form-group" style={{ flex: "1 1 100px" }}>
                            <label>{group.specLabels?.label3 || "Spec 3"}</label>
                            <input
                              type="text"
                              value={option.spec3 || ""}
                              onChange={(e) => handleOptionChange(groupIndex, optionIndex, "spec3", e.target.value)}
                              placeholder="Value..."
                            />
                          </div>

                          <div className="form-group option-default-box">
                            <label>Default</label>
                            <input
                              type="radio"
                              name={`default-option-${groupIndex}`}
                              checked={option.isDefault}
                              onChange={() => handleSetDefaultOption(groupIndex, optionIndex)}
                            />
                          </div>

                          <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "5px" }}>
                            <button type="button" className="delete-btn" onClick={() => handleRemoveOption(groupIndex, optionIndex)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button type="button" className="secondary-btn" onClick={() => handleAddOption(groupIndex)}>
                      Add Option Card
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: "24px" }}>
          <button type="button" className="admin-save-btn" onClick={handleSubmit} style={{ background: "#0f172a", color: "white", border: "none", padding: "0.85rem 2rem", fontSize: "1rem", fontWeight: "700", borderRadius: "8px", cursor: "pointer", width: "100%" }}>
            {uploadingImage ? "Uploading Image..." : editingId ? "Update Product" : "Add Product"}
          </button>
        </div>
      </div>
    </section>
  );
}