"use client";

import { useEffect, useState } from "react";

type Product = {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  description: string;
  publicId?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setMessage("");

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("");
    }
  };

  const handleAddProduct = async () => {
    if (!title || !price || !category || !description || !selectedFile) {
      setMessage("Please fill all fields and select an image.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        setMessage(uploadData.message || "Image upload failed");
        setLoading(false);
        return;
      }

      const saveRes = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          price: Number(price),
          image: uploadData.imageUrl,
          publicId: uploadData.publicId,
          category,
          description,
        }),
      });

      const saveData = await saveRes.json();

      if (!saveData.success) {
        setMessage(saveData.message || "Failed to create product");
        setLoading(false);
        return;
      }

      setMessage("Product added successfully");
      setTitle("");
      setPrice("");
      setCategory("");
      setDescription("");
      setSelectedFile(null);
      setPreviewUrl("");
      await fetchProducts();
    } catch (error) {
      console.error("ADD PRODUCT ERROR:", error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        await fetchProducts();
      }
    } catch (error) {
      console.error("DELETE PRODUCT ERROR:", error);
    }
  };

  return (
    <section className="admin-products-page">
      <div className="admin-products-header">
        <h1>Manage Products</h1>
        <p>Add products from device and manage product inventory.</p>
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
          <label>Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter product price"
          />
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
          <label>Upload Product Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Product preview"
            className="admin-banner-preview"
          />
        )}

        {message && <p className="auth-message">{message}</p>}

        <button
          type="button"
          className="primary-btn"
          onClick={handleAddProduct}
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Product"}
        </button>
      </div>

      <div className="admin-product-grid">
        {products.length === 0 ? (
          <p className="empty-admin-records">No products found.</p>
        ) : (
          products.map((product) => (
            <div className="admin-product-card" key={product._id}>
              <img
                src={product.image}
                alt={product.title}
                className="admin-product-thumb"
              />
              <h3>{product.title}</h3>
              <p>{product.category}</p>
              <strong>₹{product.price.toLocaleString("en-IN")}</strong>
              <button
                type="button"
                className="delete-btn"
                onClick={() => handleDeleteProduct(product._id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}