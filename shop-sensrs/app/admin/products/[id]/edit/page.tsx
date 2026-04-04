"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useProducts } from "@/context/ProductContext";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { getProductById, updateProduct } = useProducts();
  const product = getProductById(id);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setPrice(String(product.price));
      setCategory(product.category);
      setImage(product.image);
      setDescription(product.description);
    }
  }, [product]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    updateProduct(id, {
      title,
      price: Number(price),
      category,
      image,
      description,
    });

    router.push("/admin/products");
  };

  if (!product) {
    return (
      <section className="admin-form-page">
        <h1>Product not found</h1>
      </section>
    );
  }

  return (
    <section className="admin-form-page">
      <div className="admin-form-header">
        <h1>Edit Product</h1>
        <p>Update the product details below.</p>
      </div>

      <form className="admin-product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Product Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter product title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
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
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="/images/product.jpg"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="admin-save-btn">
            Update Product
          </button>
        </div>
      </form>
    </section>
  );
}