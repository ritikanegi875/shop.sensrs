"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
};

type Order = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  createdAt: string;
};

const statusOptions = ["pending", "confirmed", "shipped", "delivered"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("ADMIN ORDERS FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setUpdatingId(id);

      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === id ? { ...order, status } : order
          )
        );
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("STATUS UPDATE ERROR:", error);
      alert("Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p className="empty-admin-records">Loading orders...</p>;
  }

  return (
    <section className="admin-records-page">
      <div className="admin-records-header">
        <h1>Orders</h1>
        <p>Manage customer orders and update order status.</p>
      </div>

      {orders.length === 0 ? (
        <p className="empty-admin-records">No orders found.</p>
      ) : (
        <div className="admin-records-list">
          {orders.map((order) => (
            <div className="admin-record-card" key={order._id}>
              <div className="admin-record-top">
                <div>
                  <h2>Order #{order._id.slice(-6).toUpperCase()}</h2>
                  <p>{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                </div>

                <div className="admin-order-status-box">
                  <span className="record-badge">{order.status}</span>

                  <select
                    value={order.status || "pending"}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    disabled={updatingId === order._id}
                    className="admin-status-select"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-record-grid">
                <p>
                  <strong>Name:</strong> {order.fullName}
                </p>
                <p>
                  <strong>Email:</strong> {order.email}
                </p>
                <p>
                  <strong>Phone:</strong> {order.phone}
                </p>
                <p>
                  <strong>Total:</strong> ₹
                  {(order.totalPrice || 0).toLocaleString("en-IN")}
                </p>
                <p className="full-row">
                  <strong>Address:</strong> {order.addressLine}, {order.city},{" "}
                  {order.state} - {order.pincode}
                </p>
              </div>

              <div className="admin-record-items">
                <h3>Items</h3>

                {order.items?.map((item, index) => (
                  <div className="admin-record-item" key={index}>
                    <span>
                      {item.title} × {item.quantity}
                    </span>
                    <span>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
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