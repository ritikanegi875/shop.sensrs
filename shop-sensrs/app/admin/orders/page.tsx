"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

type OrderRecord = {
  _id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/orders", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        console.log("ORDERS API RESPONSE:", data);

        if (!res.ok || !data.success) {
          setError(data.message || "Failed to fetch orders");
          return;
        }

        setOrders(data.orders || []);
      } catch (err) {
        console.error("FETCH ORDERS ERROR:", err);
        setError("Something went wrong while fetching orders");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  return (
    <section className="admin-records-page">
      <div className="admin-records-header">
        <h1>Buy Now Records</h1>
        <p>All database order submissions are listed here.</p>
      </div>

      {loading ? (
        <p className="empty-admin-records">Loading orders...</p>
      ) : error ? (
        <p className="empty-admin-records">{error}</p>
      ) : orders.length === 0 ? (
        <p className="empty-admin-records">No order records found.</p>
      ) : (
        <div className="admin-records-list">
          {orders.map((order) => (
            <div className="admin-record-card" key={order._id}>
              <div className="admin-record-top">
                <h2>{order.code}</h2>
                <span className="record-badge">BUY NOW</span>
              </div>

              <div className="admin-record-grid">
                <p><strong>Name:</strong> {order.fullName}</p>
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>Phone:</strong> {order.phone}</p>
                <p><strong>City:</strong> {order.city}</p>
                <p><strong>State:</strong> {order.state}</p>
                <p><strong>Pincode:</strong> {order.pincode}</p>
                <p className="full-row"><strong>Address:</strong> {order.address}</p>
                <p className="full-row"><strong>Notes:</strong> {order.notes || "—"}</p>
                <p><strong>Total:</strong> ₹{order.totalPrice.toLocaleString("en-IN")}</p>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="admin-record-items">
                <h3>Items</h3>
                {order.items.map((item) => (
                  <div className="admin-record-item" key={`${order._id}-${item.id}`}>
                    <span>{item.title} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}