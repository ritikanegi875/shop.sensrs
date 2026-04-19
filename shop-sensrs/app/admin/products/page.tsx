"use client";

import { useEffect, useState } from "react";

type CustomizationOption = {
  label: string;
  price: number;
  isDefault: boolean;
};

type CustomizationGroup = {
  name: string;
  type: "single";
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
  options: [
    { label: "", price: 0, isDefault: true },
    { label: "", price: 0, isDefault: false },
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
      const res = await fetch("/api/products", {
        cache: "no-store",
      });

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
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Image upload failed");
      }

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

  const handleAddOption = (groupIndex: number) => {
    setCustomizations((prev) =>
      prev.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              options: [
                ...group.options,
                { label: "", price: 0, isDefault: group.options.length === 0 },
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

        const updatedOptions = group.options.filter(
          (_, idx) => idx !== optionIndex
        );

        if (updatedOptions.length > 0 && !updatedOptions.some((opt) => opt.isDefault)) {
          let lowestIndex = 0;
          for (let i = 1; i < updatedOptions.length; i++) {
            if (updatedOptions[i].price < updatedOptions[lowestIndex].price) {
              lowestIndex = i;
            }
          }
          updatedOptions[lowestIndex].isDefault = true;
        }

        return {
          ...group,
          options: updatedOptions,
        };
      })
    );
  };

  const handleOptionChange = (
    groupIndex: number,
    optionIndex: number,
    field: "label" | "price",
    value: string | number
  ) => {
    setCustomizations((prev) =>
      prev.map((group, gIndex) => {
        if (gIndex !== groupIndex) return group;

        const updatedOptions = group.options.map((option, oIndex) =>
          oIndex === optionIndex
            ? {
                ...option,
                [field]: field === "price" ? Number(value) : value,
              }
            : option
        );

        return {
          ...group,
          options: updatedOptions,
        };
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

  const normalizeCustomizations = (groups: CustomizationGroup[]) => {
    return groups
      .map((group) => {
        const validOptions = group.options.filter(
          (option) => option.label.trim() !== ""
        );

        if (validOptions.length === 0) return null;

        let normalizedOptions = validOptions.map((option) => ({
          label: option.label.trim(),
          price: Number(option.price) || 0,
          isDefault: !!option.isDefault,
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
        } else {
          let foundDefault = false;
          normalizedOptions = normalizedOptions.map((option) => {
            if (option.isDefault && !foundDefault) {
              foundDefault = true;
              return option;
            }
            return { ...option, isDefault: false };
          });
        }

        return {
          name: group.name.trim(),
          type: "single" as const,
          options: normalizedOptions,
        };
      })
      .filter(
        (group): group is CustomizationGroup =>
          !!group && group.name.trim() !== "" && group.options.length > 0
      );
  };

  const handleSubmit = async () => {
    if (!title || !price || (!image && !imageFile) || !category) {
      alert("Please fill all required product fields");
      return;
    }

    const normalizedCustomizations = hasCustomization
      ? normalizeCustomizations(customizations)
      : [];

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

      const res = await fetch(
        editingId ? `/api/products/${editingId}` : "/api/products",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

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
    setCustomizations(product.customizations || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

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
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter product title"
          />
        </div>

        <div className="form-group">
          <label>Base Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="Enter base price"
          />
        </div>

        <div className="form-group">
          <label>Upload Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          {image && !imageFile && (
            <div className="admin-image-preview">
              <img src={image} alt="Preview" className="admin-product-thumb" />
            </div>
          )}
          {imageFile && (
            <p className="muted-text">{imageFile.name}</p>
          )}
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter category"
          />
        </div>

        <div className="form-group full-width">
          <label>Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description"
          />
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
              <h2>Customization Groups</h2>
              <button
                type="button"
                className="primary-btn"
                onClick={handleAddGroup}
              >
                Add Group
              </button>
            </div>

            {customizations.length === 0 ? (
              <p className="empty-admin-records">No customization groups added yet.</p>
            ) : (
              <div className="customization-groups">
                {customizations.map((group, groupIndex) => (
                  <div className="customization-group-card" key={groupIndex}>
                    <div className="customization-group-head">
                      <h3>Group {groupIndex + 1}</h3>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleRemoveGroup(groupIndex)}
                      >
                        Remove Group
                      </button>
                    </div>

                    <div className="form-group">
                      <label>Group Name</label>
                      <input
                        type="text"
                        value={group.name}
                        onChange={(e) =>
                          handleGroupNameChange(groupIndex, e.target.value)
                        }
                        placeholder="Example: CPU / RAM / Storage"
                      />
                    </div>

                    <div className="customization-options">
                      {group.options.map((option, optionIndex) => (
                        <div className="customization-option-row" key={optionIndex}>
                          <div className="form-group">
                            <label>Option Label</label>
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) =>
                                handleOptionChange(
                                  groupIndex,
                                  optionIndex,
                                  "label",
                                  e.target.value
                                )
                              }
                              placeholder="Example: Intel i5"
                            />
                          </div>

                          <div className="form-group">
                            <label>Price</label>
                            <input
                              type="number"
                              value={option.price}
                              onChange={(e) =>
                                handleOptionChange(
                                  groupIndex,
                                  optionIndex,
                                  "price",
                                  e.target.value
                                )
                              }
                              placeholder="Enter option price"
                            />
                          </div>

                          <div className="form-group option-default-box">
                            <label>Default</label>
                            <input
                              type="radio"
                              name={`default-option-${groupIndex}`}
                              checked={option.isDefault}
                              onChange={() =>
                                handleSetDefaultOption(groupIndex, optionIndex)
                              }
                            />
                          </div>

                          <div className="option-action-box">
                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() =>
                                handleRemoveOption(groupIndex, optionIndex)
                              }
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleAddOption(groupIndex)}
                    >
                      Add Option
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="form-actions full-width">
          <button type="button" className="admin-save-btn" onClick={handleSubmit}>
            {uploadingImage
              ? "Uploading Image..."
              : editingId
              ? "Update Product"
              : "Add Product"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="empty-admin-records">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="empty-admin-records">No products found.</p>
      ) : (
        <div className="admin-product-grid">
          {products.map((product) => (
            <div className="admin-product-card" key={product._id}>
              <img
                src={product.image}
                alt={product.title}
                className="admin-product-thumb"
              />

              <h3>{product.title}</h3>
              <p>₹{product.price.toLocaleString("en-IN")}</p>
              <p>{product.category}</p>
              <p>{product.hasCustomization ? "Customizable Product" : "Standard Product"}</p>

              <div className="admin-product-actions">
                <div className="admin-action-buttons">
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}