"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Search, Filter, Download, ChevronDown, Eye, Edit3, MoreVertical, 
  ShoppingBag, Clock, CheckCircle2, IndianRupee, ChevronLeft, ChevronRight 
} from "lucide-react";

type OrderItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
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
  paymentMethod?: string;
  createdAt: string;
};

const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((order) => (order._id === id ? { ...order, status } : order))
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

  // ANALYTICS CARD CALCULATIONS
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === "pending").length;
    const confirmed = orders.filter(o => o.status === "confirmed").length;
    const revenue = orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

    return { total, pending, confirmed, revenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" ? true : order.status === statusFilter;
      const matchesSearch =
        !query ||
        order.fullName?.toLowerCase().includes(query) ||
        order.phone?.includes(query) ||
        order._id?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", fontFamily: "sans-serif", color: "#64748b" }}>
        Loading administrative order records...
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* INJECTED CSS RULES FOR BADGES & EFFECTS */}
      <style dangerouslySetInnerHTML={{__html: `
        .badge-pending { background-color: #ffedd5; color: #ea580c; }
        .badge-confirmed { background-color: #dcfce7; color: #16a34a; }
        .badge-shipped { background-color: #e0f2fe; color: #0284c7; }
        .badge-delivered { background-color: #f3e8ff; color: #7c3aed; }
        .badge-cancelled { background-color: #fee2e2; color: #dc2626; }
        .action-icon-btn:hover { background-color: #f1f5f9; color: #0f172a; }
        .table-row-item:hover { background-color: #f8fafc; }
      `}} />

      {/* TOP HEADER SECTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" }}>Orders</h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>View and manage all customer orders.</p>
        </div>
        
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: "6px", backgroundColor: "#ffffff", fontSize: "14px", fontWeight: "500", color: "#334155", cursor: "pointer" }}>
            <Filter size={16} /> Filter
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: "6px", backgroundColor: "#ffffff", fontSize: "14px", fontWeight: "500", color: "#334155", cursor: "pointer" }}>
            <Download size={16} /> Export
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: "8px", border: "none", padding: "8px 16px", borderRadius: "6px", backgroundColor: "#14321a", fontSize: "14px", fontWeight: "500", color: "#ffffff", cursor: "pointer" }}>
            Update Order Status <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* OVERVIEW ANALYTICS METRIC ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "24px" }}>
        
        {/* TOTAL ORDERS CARD */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShoppingBag size={20} color="#16a34a" />
              </div>
              <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Total Orders</span>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "12px 0 4px 0" }}>{stats.total}</h2>
            <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>+20% <span style={{ color: "#94a3b8", fontWeight: "400" }}>vs last 7 days</span></span>
          </div>
          <svg width="60" height="30" viewBox="0 0 60 30" fill="none"><path d="M2 28L15 18L30 24L58 2" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>

        {/* PENDING ORDERS CARD */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={20} color="#ea580c" />
              </div>
              <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Pending Orders</span>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "12px 0 4px 0" }}>{stats.pending}</h2>
            <span style={{ fontSize: "12px", color: "#ea580c", fontWeight: "600" }}>+50% <span style={{ color: "#94a3b8", fontWeight: "400" }}>vs last 7 days</span></span>
          </div>
          <svg width="60" height="30" viewBox="0 0 60 30" fill="none"><path d="M2 25L18 20L35 28L58 5" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>

        {/* CONFIRMED ORDERS CARD */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={20} color="#2563eb" />
              </div>
              <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Confirmed Orders</span>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "12px 0 4px 0" }}>{stats.confirmed}</h2>
            <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: "600" }}>+10% <span style={{ color: "#94a3b8", fontWeight: "400" }}>vs last 7 days</span></span>
          </div>
          <svg width="60" height="30" viewBox="0 0 60 30" fill="none"><path d="M2 28L20 15L40 22L58 8" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>

        {/* TOTAL REVENUE CARD */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IndianRupee size={18} color="#7c3aed" />
              </div>
              <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Total Revenue</span>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "12px 0 4px 0" }}>
              ₹{stats.revenue.toLocaleString("en-IN")}
            </h2>
            <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>+18% <span style={{ color: "#94a3b8", fontWeight: "400" }}>vs last 7 days</span></span>
          </div>
          <svg width="60" height="30" viewBox="0 0 60 30" fill="none"><path d="M2 26L15 28L35 12L58 2" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>

      </div>

      {/* SYSTEM FILTERS INTERACTION DESK */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderTopLeftRadius: "12px", borderTopRightRadius: "12px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", borderBottom: "none" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input 
            type="text"
            placeholder="Search orders by name, phone or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 16px 10px 40px", fontSize: "14px", border: "1px solid #e2e8f0", borderRadius: "8px", outline: "none", boxSizing: "border-box", backgroundColor: "#ffffff" }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "10px 16px", fontSize: "14px", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#334155", backgroundColor: "#ffffff", outline: "none", cursor: "pointer", minWidth: "160px" }}
        >
          <option value="all">All Status</option>
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* MAIN ORDERS TABULAR SHEET DATA GRID */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: "600" }}>
              <th style={{ padding: "16px", width: "40px" }}><input type="checkbox" style={{ cursor: "pointer" }} /></th>
              <th style={{ padding: "16px" }}>Order ID</th>
              <th style={{ padding: "16px" }}>Customer</th>
              <th style={{ padding: "16px" }}>Items</th>
              <th style={{ padding: "16px" }}>Amount</th>
              {/* <th style={{ padding: "16px" }}>Payment</th> */}
              <th style={{ padding: "16px" }}>Status</th>
              <th style={{ padding: "16px" }}>Order Date</th>
              {/* <th style={{ padding: "16px", textAlign: "right" }}>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>No structural system records matched your filter requirements.</td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const firstItem = order.items?.[0];
                const totalQty = order.items?.reduce((a, c) => a + c.quantity, 0) || 1;

                return (
                  <tr key={order._id} className="table-row-item" style={{ borderBottom: "1px solid #f1f5f9", color: "#334155", transition: "background 0.2s" }}>
                    <td style={{ padding: "16px" }}><input type="checkbox" style={{ cursor: "pointer" }} /></td>
                    <td style={{ padding: "16px", fontWeight: "600", color: "#16a34a" }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: "600", color: "#0f172a" }}>{order.fullName}</div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{order.phone}</div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {firstItem?.image ? (
                          <img src={firstItem.image} alt={firstItem.title} style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "4px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }} />
                        ) : (
                          <div style={{ width: "36px", height: "36px", borderRadius: "4px", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#94a3b8" }}>No img</div>
                        )}
                        <div>
                          <div style={{ fontWeight: "500", color: "#334155", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{firstItem?.title || "Product Item"}</div>
                          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>x{totalQty} items</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px", fontWeight: "600", color: "#0f172a" }}>
                      ₹{(order.totalPrice || 0).toLocaleString("en-IN")}
                    </td>
                    {/* <td style={{ padding: "16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", border: "1px solid #dbeafe", padding: "4px 8px", borderRadius: "4px", backgroundColor: "#eff6ff", color: "#1e40af" }}>
                        {order.paymentMethod || "COD"}
                      </span>
                    </td> */}
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className={`badge-${order.status || "pending"}`} style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", textTransform: "capitalize" }}>
                          {order.status || "pending"}
                        </span>
                        
                        <select
                          value={order.status || "pending"}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                          style={{ border: "none", backgroundColor: "transparent", cursor: "pointer", color: "#64748b", outline: "none", fontSize: "12px" }}
                        >
                          {statusOptions.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td style={{ padding: "16px", fontSize: "13px", color: "#475569" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-GB")}, {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    {/* <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px", color: "#64748b" }}>
                        <button className="action-icon-btn" style={{ border: "none", background: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", color: "inherit" }}><Eye size={16} /></button>
                        <button className="action-icon-btn" style={{ border: "none", background: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", color: "inherit" }}><Edit3 size={16} /></button>
                        <button className="action-icon-btn" style={{ border: "none", background: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", color: "inherit" }}><MoreVertical size={16} /></button>
                      </div>
                    </td> */}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* BOTTOM PAGINATION CONTROLLER ROW */}
        <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", backgroundColor: "#ffffff", fontSize: "14px", color: "#64748b" }}>
          <span>Showing 1 to {filteredOrders.length} of {filteredOrders.length} orders</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button style={{ border: "1px solid #e2e8f0", background: "#ffffff", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", color: "#94a3b8" }}><ChevronLeft size={16} /></button>
            <span style={{ width: "32px", height: "32px", borderRadius: "6px", backgroundColor: "#dcfce7", color: "#14321a", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>1</span>
            <button style={{ border: "1px solid #e2e8f0", background: "#ffffff", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", color: "#94a3b8" }}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

    </div>
  );
}