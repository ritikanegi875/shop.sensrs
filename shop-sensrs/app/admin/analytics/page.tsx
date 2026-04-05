"use client";

import { useEffect, useState } from "react";

type Analytics = {
  totalOrders: number;
  totalProducts: number;
  totalBanners: number;
  totalRevenue: number;
};

type Order = {
  _id: string;
  fullName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
};

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalOrders: 0,
    totalProducts: 0,
    totalBanners: 0,
    totalRevenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics", {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success) {
          setAnalytics(data.analytics);
          setRecentOrders(data.recentOrders || []);
        }
      } catch (error) {
        console.error("ADMIN ANALYTICS PAGE ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return <p className="empty-admin-records">Loading analytics...</p>;
  }

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <h1>Admin Analytics</h1>
        <p>Overview of store performance and recent activity.</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <h3>Total Orders</h3>
          <p>{analytics.totalOrders}</p>
        </div>

        <div className="admin-stat-card">
          <h3>Total Products</h3>
          <p>{analytics.totalProducts}</p>
        </div>

        <div className="admin-stat-card">
          <h3>Total Banners</h3>
          <p>{analytics.totalBanners}</p>
        </div>

        <div className="admin-stat-card admin-card-full">
          <h3>Total Revenue</h3>
          <p>₹{analytics.totalRevenue.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="admin-preview-card">
        <div className="admin-preview-head">
          <h2>Recent Orders</h2>
        </div>

        {recentOrders.length === 0 ? (
          <p className="empty-admin-records">No recent orders found.</p>
        ) : (
          <div className="admin-preview-list">
            {recentOrders.map((order) => (
              <div className="admin-preview-item" key={order._id}>
                <div>
                  <strong>{order.fullName}</strong>
                  <p>{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <strong>
                    ₹{(order.totalPrice || 0).toLocaleString("en-IN")}
                  </strong>
                  <p>{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}