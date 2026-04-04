"use client";

import Link from "next/link";
import { useProducts } from "@/context/ProductContext";

export default function AdminProductsPage() {
  const { products, deleteProduct } = useProducts();

  return (
    <section className="admin-products-page">
      <div className="admin-products-header">
        <div>
          <h1>Manage Products</h1>
          <p>View and control all products from the admin panel.</p>
        </div>

        <Link href="/admin/products/new">
          <button className="admin-add-btn">Add New Product</button>
        </Link>
      </div>

      <div className="admin-products-table-wrapper">
        <table className="admin-products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.title}</td>
                <td>{product.category}</td>
                <td>₹{product.price.toLocaleString("en-IN")}</td>
                <td>{product.image}</td>
                <td>
                  <div className="admin-action-buttons">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <button className="edit-btn">Edit</button>
                    </Link>
                    <button
                      className="delete-btn"
                      onClick={() => deleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}