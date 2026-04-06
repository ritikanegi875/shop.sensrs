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
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  pendingAppointments: number;
};

type Order = {
  _id: string;
  fullName?: string;
  totalPrice?: number;
  status?: string;
  createdAt: string;
};

type Appointment = {
  _id: string;
  fullName?: string;
  date?: string;
  timeSlot?: string;
  status?: string;
};

export default function AdminPage() {
  const [stats, setStats] = useState<StatsData>({
    totalOrders: 0,
    totalAppointments: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    pendingAppointments: 0,
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

  const countData = [
    { name: "Orders", value: stats.totalOrders, fill: "#e11d48" },
    { name: "Appointments", value: stats.totalAppointments, fill: "#2563eb" },
    { name: "Users", value: stats.totalUsers, fill: "#16a34a" },
  ];

  const pendingData = [
    { name: "Pending Orders", value: stats.pendingOrders },
    { name: "Pending Appointments", value: stats.pendingAppointments },
  ];

  const pieColors = ["#e11d48", "#2563eb"];

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Track store performance, customers, orders, and appointments.</p>
      </div>

      {loading ? (
        <p className="empty-admin-records">Loading dashboard...</p>
      ) : (
        <>
          <div className="admin-stats-grid admin-stats-grid-six">
            <div className="admin-stat-card">
              <h3>Total Orders</h3>
              <p>{stats.totalOrders}</p>
            </div>

            <div className="admin-stat-card">
              <h3>Total Appointments</h3>
              <p>{stats.totalAppointments}</p>
            </div>

            <div className="admin-stat-card">
              <h3>Total Users</h3>
              <p>{stats.totalUsers}</p>
            </div>

            <div className="admin-stat-card">
              <h3>Total Revenue</h3>
              <p>₹{(stats.totalRevenue || 0).toLocaleString("en-IN")}</p>
            </div>

            <div className="admin-stat-card">
              <h3>Pending Orders</h3>
              <p>{stats.pendingOrders}</p>
            </div>

            <div className="admin-stat-card">
              <h3>Pending Appointments</h3>
              <p>{stats.pendingAppointments}</p>
            </div>
          </div>

          <div className="admin-chart-grid">
            <div className="admin-chart-card">
              <h2>Store Counts Overview</h2>
              <div className="admin-chart-box">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={countData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#b3b3b3" />
                    <YAxis stroke="#b3b3b3" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111",
                        border: "1px solid #333",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {countData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="admin-chart-card">
              <h2>Pending Workload</h2>
              <div className="admin-chart-box">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={pendingData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label
                    >
                      {pendingData.map((_, index) => (
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
              <p>Check customer orders and update order status.</p>
            </Link>

            <Link href="/admin/appointments" className="admin-action-card">
              <h3>View Appointments</h3>
              <p>Manage appointments and update appointment status.</p>
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
                        <p>{order.status || "pending"}</p>
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
                        <p>{appointment.status || "pending"}</p>
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