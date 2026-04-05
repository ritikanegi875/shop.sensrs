"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type StatsData = {
  totalOrders: number;
  totalAppointments: number;
  totalRevenue: number;
};

type Order = {
  _id: string;
  fullName?: string;
  totalPrice?: number;
  createdAt: string;
};

type Appointment = {
  _id: string;
  fullName?: string;
  date?: string;
  timeSlot?: string;
};

export default function AdminPage() {
  const [stats, setStats] = useState<StatsData>({
    totalOrders: 0,
    totalAppointments: 0,
    totalRevenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>(
    []
  );
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

  const barData = [
    { name: "Orders", value: stats.totalOrders },
    { name: "Appointments", value: stats.totalAppointments },
    { name: "Revenue", value: stats.totalRevenue },
  ];

  const pieData = [
    { name: "Orders", value: stats.totalOrders },
    { name: "Appointments", value: stats.totalAppointments },
  ];

  const pieColors = ["#e11d48", "#2563eb"];

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage products, banners, orders, appointments, and analytics.</p>
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
              <p>₹{(stats.totalRevenue || 0).toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="admin-chart-grid">
            <div className="admin-chart-card">
              <h2>Performance Overview</h2>
              <div className="admin-chart-box">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#b3b3b3" />
                    <YAxis stroke="#b3b3b3" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111",
                        border: "1px solid #333",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      <Cell fill="#e11d48" />
                      <Cell fill="#2563eb" />
                      <Cell fill="#16a34a" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="admin-chart-card">
              <h2>Orders vs Appointments</h2>
              <div className="admin-chart-box">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111",
                        border: "1px solid #333",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="admin-actions-grid">
            <Link href="/admin/products" className="admin-action-card">
              <h3>Manage Products</h3>
              <p>Add, edit, and delete product listings.</p>
            </Link>

            <Link href="/admin/banners" className="admin-action-card">
              <h3>Manage Banners</h3>
              <p>Upload and manage homepage banners.</p>
            </Link>

            <Link href="/admin/orders" className="admin-action-card">
              <h3>View Orders</h3>
              <p>Check customer orders and order details.</p>
            </Link>

            <Link href="/admin/appointments" className="admin-action-card">
              <h3>View Appointments</h3>
              <p>Manage all appointment bookings.</p>
            </Link>

            <Link href="/admin/analytics" className="admin-action-card">
              <h3>Analytics</h3>
              <p>View revenue, orders, products, and recent activity.</p>
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
                        <strong>{order.fullName || "Customer"}</strong>
                        <p>
                          {new Date(order.createdAt).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <strong>
                          ₹{(order.totalPrice || 0).toLocaleString("en-IN")}
                        </strong>
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
                        <strong>{appointment.fullName || "Customer"}</strong>
                        <p>{appointment.date || "No date"}</p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <strong>{appointment.timeSlot || "No slot"}</strong>
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