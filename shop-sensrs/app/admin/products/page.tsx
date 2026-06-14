"use client";

import { useEffect, useState } from "react";

type CustomizationOption = {
  label: string;
  price: number;
  isDefault: boolean;
  spec1?: string;
  spec2?: string;
  spec3?: string;
};

type CustomizationGroup = {
  name: string; // Dynamic Tab Name (e.g., Motor, Battery)
  type: "single";
  description?: string; // Explicitly declared to allow normalization
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

  const [hasCustomization, setHasCustomization] = useState(false);
  const [customizations, setCustomizations] = useState<CustomizationGroup[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
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

    // FIXED: Switched from inline array chaining to a clean native imperative builder array push loop.
    // This removes the type predicate guard errors completely and is much safer for TypeScript.
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    <section className="admin-products-page">
      <style dangerouslySetInnerHTML={{__html: `
        .admin-products-page { padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; }
        .admin-products-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; }
        .admin-products-header h1 { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 0; }
        .admin-products-header p { color: #64748b; margin: 0.25rem 0 0 0; font-size: 0.95rem; }
        .admin-add-btn { background: #64748b; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
        .admin-product-form-box { background: white; border: 1px solid #e2e8f0; padding: 2rem; border-radius: 12px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-size: 0.875rem; font-weight: 600; color: #334155; }
        .form-group input[type="text"], .form-group input[type="number"], .form-group textarea { padding: 0.65rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; width: 100%; box-sizing: border-box; outline: none; transition: border 0.15s; }
        .form-group input:focus, .form-group textarea:focus { border-color: #0284c7; box-shadow: 0 0 0 1px #0284c7; }
        .admin-image-preview { margin-top: 0.5rem; }
        .admin-product-thumb { width: 80px; height: 70px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; }
        .customization-toggle { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none; }
        .customization-toggle input { width: 1.15rem; height: 1.15rem; cursor: pointer; }
        .customization-builder { border-top: 2px dashed #e2e8f0; padding-top: 2rem; margin-top: 0.5rem; }
        .customization-builder-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .customization-builder-head h2 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
        .primary-btn { background: #0284c7; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
        .secondary-btn { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; margin-top: 0.5rem; }
        .delete-btn { background: #ef4444; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
        .customization-group-card { background: #fff; border: 1px solid #cbd5e1; padding: 1.5rem; margin-bottom: 1.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 1.25rem; box-shadow: 0 1px 3px rgb(0 0 0 / 0.05); }
        .customization-group-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem; }
        .customization-group-head h3 { font-size: 1.05rem; font-weight: 700; color: #334155; margin: 0; }
        .spec-label-customizer-row { display: flex; gap: 1rem; background: #f8fafc; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; }
        .customization-option-row-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; padding-bottom: 1.25rem; margin-bottom: 1.25rem; border-bottom: 1px dashed #e2e8f0; background: #fafafa; padding: 1rem; border-radius: 6px; align-items: flex-end; }
        .option-default-box { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 60px; }
        .option-default-box input { width: 1.15rem; height: 1.15rem; cursor: pointer; margin-top: 0.5rem; }
        .admin-save-btn { background: #0f172a; color: white; border: none; padding: 0.85rem 2rem; font-size: 1rem; font-weight: 700; border-radius: 8px; cursor: pointer; transition: background 0.15s; width: 100%; }
        .admin-save-btn:hover { background: #1e293b; }
        .form-actions { grid-column: span 2; margin-top: 1rem; }
        .admin-product-management { grid-column: span 2; }
        .admin-product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
        .admin-product-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; box-shadow: 0 1px 3px rgb(0 0 0 / 0.04); }
        .admin-product-card h3 { margin: 0; font-size: 1.1rem; font-weight: 600; color: #1e293b; }
        .admin-product-card p { margin: 0; color: #64748b; font-size: 0.9rem; }
        .admin-product-actions { margin-top: auto; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
        .admin-action-buttons { display: flex; gap: 0.5rem; }
        .admin-action-buttons .edit-btn { background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; cursor: pointer; flex: 1; font-size: 0.85rem; text-align: center; }
        .admin-action-buttons .delete-btn { flex: 1; text-align: center; }
        .empty-admin-records { text-align: center; color: #64748b; padding: 2rem; grid-column: span 2; }
      `}} />

      <div className="admin-products-header">
        <div>
          <h1>Manage Products</h1>
          <p>Add, edit, delete, and configure customizable products.</p>
        </div>
        {editingId && (
          <button className="admin-add-btn" type="button" onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </div>

      <div className="admin-product-form-box">
        <div className="form-group">
          <label>Product Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter product title" />
        </div>

        <div className="form-group">
          <label>Base Price</label>
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Enter base price" />
        </div>

        <div className="form-group">
          <label>Upload Product Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          {image && !imageFile && (
            <div className="admin-image-preview">
              <img src={image} alt="Preview" className="admin-product-thumb" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Category</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Enter category" />
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

        {hasCustomization && (
          <div className="full-width customization-builder">
            <div className="customization-builder-head">
              <h2>Customization Groups / Configurator Tabs</h2>
              <button type="button" className="primary-btn" onClick={handleAddGroup}>
                Add Tab Group
              </button>
            </div>

            {customizations.length === 0 ? (
              <p className="empty-admin-records">No customization tabs added yet.</p>
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

                          <div className="option-action-box" style={{ display: "flex", alignItems: "flex-end", paddingBottom: "5px" }}>
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

        <div className="form-actions full-width">
          <button type="button" className="admin-save-btn" onClick={handleSubmit}>
            {uploadingImage ? "Uploading Image..." : editingId ? "Update Product" : "Add Product"}
          </button>
        </div>
      </div>

      <div className="admin-product-management">
        {loading ? (
          <p className="empty-admin-records">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="empty-admin-records">No products found.</p>
        ) : (
          <div className="admin-product-grid">
            {products.map((product) => (
              <div className="admin-product-card" key={product._id}>
                <img src={product.image} alt={product.title} className="admin-product-thumb" />
                <h3>{product.title}</h3>
                <p>₹{product.price.toLocaleString("en-IN")}</p>
                <p>{product.category}</p>
                <div className="admin-product-actions">
                  <div className="admin-action-buttons">
                    <button type="button" className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                    <button type="button" className="delete-btn" onClick={() => handleDelete(product._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}