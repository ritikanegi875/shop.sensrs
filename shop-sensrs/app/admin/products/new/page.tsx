"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/context/ProductContext";

export default function NewProductPage() {
  const router = useRouter();
  const { addProduct } = useProducts();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    addProduct({
      title,
      price: Number(price),
      category,
      image,
      description,
    });

    router.push("/admin/products");
  };

  return (
    <section className="admin-form-page">
      <div className="admin-form-header">
        <h1>Add New Product</h1>
        <p>Fill in the product details to create a new listing.</p>
      </div>

      <form className="admin-product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Product Title</label>
          <input
            id="title"
            type="text"
            placeholder="Enter product title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            id="price"
            type="number"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category</option>
            <option value="Audio">Audio</option>
            <option value="Wearables">Wearables</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Image Path</label>
          <input
            id="image"
            type="text"
            placeholder="/images/product.jpg"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={5}
            placeholder="Enter product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="admin-save-btn">
            Save Product
          </button>
        </div>
      </form>
    </section>
  );
}