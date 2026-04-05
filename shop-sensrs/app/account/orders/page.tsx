"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function AccountOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders/my-orders", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!data.success) {
          router.push("/auth/login?redirect=/account/orders");
          return;
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error("ACCOUNT ORDERS ERROR:", error);
        router.push("/auth/login?redirect=/account/orders");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [router]);

  if (loading) {
    return <p className="empty-admin-records">Loading orders...</p>;
  }

  return (
    <section className="account-orders-page">
      <div className="account-orders-header">
        <h1>My Orders</h1>
        <p>Track your recent purchases and order details.</p>
      </div>

      {orders.length === 0 ? (
        <div className="account-orders-empty">
          <p className="empty-admin-records">You have not placed any orders yet.</p>
          <Link href="/products" className="primary-btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="account-orders-list">
          {orders.map((order) => (
            <div className="account-order-card" key={order._id}>
              <div className="account-order-top">
                <div>
                  <h2>Order #{order._id.slice(-6).toUpperCase()}</h2>
                  <p>{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                </div>

                <span className="record-badge">
                  {order.status || "pending"}
                </span>
              </div>

              <div className="account-order-grid">
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

              <div className="account-order-items">
                <h3>Items</h3>

                {order.items?.map((item, index) => (
                  <div className="account-order-item" key={index}>
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