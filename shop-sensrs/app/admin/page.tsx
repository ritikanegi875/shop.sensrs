"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Calendar,
  Users,
  Image as ImageIcon,
  BarChart3,
  Download,
  Settings
} from "lucide-react";

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
    totalOrders: 6,
    totalAppointments: 1,
    totalUsers: 5,
    totalRevenue: 391700,
    pendingOrders: 3,
    pendingAppointments: 1,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
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
    { name: "Pending Appointments", value: stats.pendingAppointments, fill: "#2563eb" },
    { name: "Pending Orders", value: stats.pendingOrders, fill: "#e11d48" },
  ];

  const getAvatarColor = (name: string) => {
    const colors = ["#f472b6", "#22d3ee", "#a78bfa", "#facc15"];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: ShoppingBag },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Appointments", href: "/admin/appointments", icon: Calendar },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Banners", href: "/admin/banners", icon: ImageIcon },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Export Records", href: "/api/export", icon: Download, isExternal: true },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="admin-layout-container" style={{ display: "flex", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="admin-sidebar" style={{ width: "260px", backgroundColor: "#ffffff", borderRight: "1px solid #e2e8f0", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div className="sidebar-logo" style={{ fontSize: "22px", fontWeight: "bold", paddingLeft: "12px", marginBottom: "32px", color: "#000" }}>
          Shop.SEnSRS
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.label === "Dashboard" && pathname === "/admin");

            return (
              <Link 
                key={item.label} 
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  textDecoration: "none",
                  color: isActive ? "#16a34a" : "#64748b",
                  backgroundColor: isActive ? "#f0fdf4" : "transparent",
                  transition: "all 0.2s"
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="admin-main-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* COMPONENT BODY */}
        <div style={{ padding: "32px", overflowY: "auto", flex: 1 }}>
          <div className="admin-dashboard-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" }}>Admin Dashboard</h1>
              <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Track store performance, customers, orders, and appointments.</p>
            </div>
            <div style={{ padding: "8px 12px", backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "13px", color: "#334155", cursor: "pointer" }}>
              Jun 14, 2026 - Jun 20, 2026 ▾
            </div>
          </div>

          {loading ? (
            <p className="empty-admin-records">Loading dashboard...</p>
          ) : (
            <>
              {/* SIX METRIC GRID WITH STATS AND COMPARISONS */}
              <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "24px" }}>
                
                {/* CARD 1: Total Orders */}
                <div className="admin-stat-card" style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Total Orders</span>
                      <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "8px 0 4px 0" }}>{stats.totalOrders}</h2>
                      {/* <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "500" }}>▲ +20% vs last 7 days</span> */}
                    </div>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
                      <ShoppingCart size={20} />
                    </div>
                  </div>
                </div>

                {/* CARD 2: Total Appointments */}
                <div className="admin-stat-card" style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Total Appointments</span>
                      <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "8px 0 4px 0" }}>{stats.totalAppointments}</h2>
                      {/* <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>+0% vs last 7 days</span> */}
                    </div>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
                      <Calendar size={20} />
                    </div>
                  </div>
                </div>

                {/* CARD 3: Total Users */}
                <div className="admin-stat-card" style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Total Users</span>
                      <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "8px 0 4px 0" }}>{stats.totalUsers}</h2>
                      {/* <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "500" }}>▲ +25% vs last 7 days</span> */}
                    </div>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                      <Users size={20} />
                    </div>
                  </div>
                </div>

                {/* CARD 4: Total Revenue */}
                <div className="admin-stat-card" style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Total Revenue</span>
                      <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "8px 0 4px 0" }}>₹{(stats.totalRevenue || 0).toLocaleString("en-IN")}</h2>
                      {/* <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "500" }}>▲ +18% vs last 7 days</span> */}
                    </div>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
                      <span style={{ fontSize: "18px", fontWeight: "bold" }}>₹</span>
                    </div>
                  </div>
                </div>

                {/* CARD 5: Pending Orders */}
                <div className="admin-stat-card" style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Pending Orders</span>
                      <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "8px 0 4px 0" }}>{stats.pendingOrders}</h2>
                      {/* <span style={{ fontSize: "12px", color: "#ea580c", fontWeight: "500" }}>▲ +50% vs last 7 days</span> */}
                    </div>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", color: "#ea580c" }}>
                      <ShoppingBag size={20} />
                    </div>
                  </div>
                </div>

                {/* CARD 6: Pending Appointments */}
                <div className="admin-stat-card" style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Pending Appointments</span>
                      <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "8px 0 4px 0" }}>{stats.pendingAppointments}</h2>
                      {/* <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>+0% vs last 7 days</span> */}
                    </div>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed" }}>
                      <Calendar size={20} />
                    </div>
                  </div>
                </div>

              </div>

              {/* CHARTS LAYOUT */}
              <div className="admin-chart-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px", marginBottom: "24px" }}>
                
                {/* Store Counts Bar Chart */}
                <div className="admin-chart-card" style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Store Counts Overview</h3>
                    <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "12px", height: "12px", backgroundColor: "#e11d48", borderRadius: "3px" }}></span>Orders</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "12px", height: "12px", backgroundColor: "#2563eb", borderRadius: "3px" }}></span>Appointments</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "12px", height: "12px", backgroundColor: "#16a34a", borderRadius: "3px" }}></span>Users</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={countData} barSize={60}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {countData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Workload Donut Chart */}
                <div className="admin-chart-card" style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #e2e8f0" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "20px" }}>Pending Workload</h3>
                  <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={pendingData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {pendingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "16px", fontSize: "12px", marginTop: "12px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "10px", height: "10px", backgroundColor: "#2563eb", borderRadius: "50%" }}></span>Pending Appointments ({stats.pendingAppointments})</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "10px", height: "10px", backgroundColor: "#e11d48", borderRadius: "50%" }}></span>Pending Orders ({stats.pendingOrders})</span>
                  </div>
                </div>
              </div>

              {/* QUICK LINKS GRID */}
              <div className="admin-actions-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "32px" }}>
                {[
                  { title: "Manage Products", desc: "Add, edit, and delete product listings.", href: "/admin/products", icon: ShoppingBag, color: "#f0fdf4", iconColor: "#16a34a" },
                  { title: "Manage Banners", desc: "Upload and manage homepage banners.", href: "/admin/banners", icon: ImageIcon, color: "#f5f3ff", iconColor: "#7c3aed" },
                  { title: "View Orders", desc: "Check customer orders and update order status.", href: "/admin/orders", icon: ShoppingCart, color: "#fff7ed", iconColor: "#ea580c" },
                  { title: "View Appointments", desc: "Manage appointments and update status.", href: "/admin/appointments", icon: Calendar, color: "#e0f2fe", iconColor: "#0284c7" },
                  { title: "Export Records", desc: "Download orders and appointments in Excel.", href: "/api/export", icon: Download, color: "#f0fdf4", iconColor: "#16a34a", isExternal: true },
                ].map((action, i) => (
                  <Link key={i} href={action.href} style={{ textDecoration: "none", backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: action.color, display: "flex", alignItems: "center", justifyContent: "center", color: action.iconColor }}>
                      <action.icon size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", margin: "0 0 4px 0" }}>{action.title}</h4>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>{action.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* RECENT RECORDS TABLES SPLIT */}
              <div className="admin-preview-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                
                {/* Recent Orders List */}
                <div className="admin-preview-card" style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Recent Orders</h3>
                    <Link href="/admin/orders" style={{ fontSize: "13px", color: "#16a34a", fontWeight: "600", textDecoration: "none" }}>View All</Link>
                  </div>

                  {recentOrders.length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: "14px" }}>No recent orders</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {recentOrders.map((order) => (
                        <div key={order._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: getAvatarColor(order.fullName || "C"), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600" }}>
                              {(order.fullName || "C").charAt(0).toLowerCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>{order.fullName || "Customer"}</div>
                              <div style={{ fontSize: "12px", color: "#94a3b8" }}>{new Date(order.createdAt).toLocaleString("en-IN")}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>₹{(order.totalPrice || 0).toLocaleString("en-IN")}</div>
                            <span style={{ display: "inline-block", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "12px", textTransform: "capitalize", backgroundColor: order.status === "Confirmed" ? "#e0f2fe" : "#fff7ed", color: order.status === "Confirmed" ? "#0369a1" : "#c2410c" }}>
                              {order.status || "pending"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Appointments List */}
                <div className="admin-preview-card" style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Recent Appointments</h3>
                    <Link href="/admin/appointments" style={{ fontSize: "13px", color: "#16a34a", fontWeight: "600", textDecoration: "none" }}>View All</Link>
                  </div>

                  {recentAppointments.length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: "14px" }}>No recent appointments</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {recentAppointments.map((app) => (
                        <div key={app._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: getAvatarColor(app.fullName || "A"), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600" }}>
                              {(app.fullName || "A").charAt(0).toLowerCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>{app.fullName || "Customer"}</div>
                              <div style={{ fontSize: "12px", color: "#94a3b8" }}>{app.date || "No date"}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{app.timeSlot || "No slot"}</div>
                            <span style={{ display: "inline-block", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "12px", backgroundColor: "#fff7ed", color: "#c2410c" }}>
                              {app.status || "pending"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}