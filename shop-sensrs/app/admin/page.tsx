"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Order = {
  _id: string;
  code: string;
  fullName: string;
  totalPrice: number;
  createdAt: string;
};

type Appointment = {
  _id: string;
  code: string;
  fullName: string;
  date: string;
  timeSlot: string;
};

type StatsData = {
  totalOrders: number;
  totalAppointments: number;
  totalRevenue: number;
};

export default function AdminPage() {
  const [stats, setStats] = useState<StatsData>({
    totalOrders: 0,
    totalAppointments: 0,
    totalRevenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats", {
          cache: "no-store",
        });
        const data = await res.json();

        if (data.success) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders || []);
          setRecentAppointments(data.recentAppointments || []);
        }
      } catch (error) {
        console.error("ADMIN FETCH ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage products, orders, appointments, banners, and exports.</p>
      </div>

      {loading ? (
        <p className="empty-admin-records">Loading dashboard...</p>
      ) : (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <h3>Total Orders</h3>
              <p>{stats.totalOrders}</p>
            </div>

            <div className="admin-stat-card">
              <h3>Total Appointments</h3>
              <p>{stats.totalAppointments}</p>
            </div>

            <div className="admin-stat-card">
              <h3>Total Revenue</h3>
              <p>₹{stats.totalRevenue.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="admin-actions-grid">
            <Link href="/admin/products" className="admin-action-card">
              <h3>Manage Products</h3>
              <p>Add, edit, and organize product listings.</p>
            </Link>

            <Link href="/admin/banners" className="admin-action-card">
              <h3>Manage Banners</h3>
              <p>Upload homepage banners from device and manage slider images.</p>
            </Link>

            <Link href="/admin/orders" className="admin-action-card">
              <h3>View Orders</h3>
              <p>Track all Buy Now records from customers.</p>
            </Link>

            <Link href="/admin/appointments" className="admin-action-card">
              <h3>View Appointments</h3>
              <p>Manage all booked meeting slots.</p>
            </Link>

            <a href="/api/export" className="admin-action-card">
              <h3>Export Records</h3>
              <p>Download orders and appointments in Excel format.</p>
            </a>
          </div>

          <div className="admin-preview-grid">
            <div className="admin-preview-card">
              <div className="admin-preview-head">
                <h2>Recent Orders</h2>
                <Link href="/admin/orders">See all</Link>
              </div>

              {recentOrders.length === 0 ? (
                <p className="empty-admin-records">No recent orders</p>
              ) : (
                <div className="admin-preview-list">
                  {recentOrders.map((order) => (
                    <div className="admin-preview-item" key={order._id}>
                      <div>
                        <strong>{order.code}</strong>
                        <p>{order.fullName}</p>
                      </div>
                      <div>
                        <strong>₹{(order.totalPrice || 0).toLocaleString("en-IN")}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-preview-card">
              <div className="admin-preview-head">
                <h2>Recent Appointments</h2>
                <Link href="/admin/appointments">See all</Link>
              </div>

              {recentAppointments.length === 0 ? (
                <p className="empty-admin-records">No recent appointments</p>
              ) : (
                <div className="admin-preview-list">
                  {recentAppointments.map((appointment) => (
                    <div className="admin-preview-item" key={appointment._id}>
                      <div>
                        <strong>{appointment.code}</strong>
                        <p>{appointment.fullName}</p>
                      </div>
                      <div>
                        <strong>{appointment.date}</strong>
                        <p>{appointment.timeSlot}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}