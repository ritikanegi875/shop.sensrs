"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Search, Filter, Download, Plus, ChevronDown, Eye, Edit3, MoreVertical, 
  Calendar, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight 
} from "lucide-react";

type Appointment = {
  _id: string;
  code?: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  date: string;
  timeSlot: string;
  purpose?: string;
  message?: string;
  status: string;
  createdAt: string;
};

const statusOptions = ["pending", "approved", "completed", "cancelled"];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("ADMIN APPOINTMENTS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (data.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status } : a))
        );
      } else {
        alert(data.message || "Failed to update");
      }
    } catch (error) {
      console.error("APPOINTMENT UPDATE ERROR:", error);
      alert("Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  // ANALYTICS CARD OVERVIEW METRICS
  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === "pending").length;
    const completed = appointments.filter(a => a.status === "completed").length;
    const cancelled = appointments.filter(a => a.status === "cancelled").length;

    return { total, pending, completed, cancelled };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const q = search.toLowerCase().trim();
    return appointments.filter((a) => {
      const matchesStatus = statusFilter === "all" ? true : a.status === statusFilter;
      const matchesSearch =
        !q ||
        a.fullName?.toLowerCase().includes(q) ||
        a.phone?.includes(q) ||
        a.code?.toLowerCase().includes(q) ||
        a._id?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [appointments, search, statusFilter]);

  // PICK FIRST PENDING APPOINTMENT FOR THE UPCOMING WIDGET BAR BELOW
  const upcomingAppointment = useMemo(() => {
    return appointments.find(a => a.status === "pending") || null;
  }, [appointments]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", fontFamily: "sans-serif", color: "#64748b" }}>
        Loading administrative scheduling records...
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* SCOPED BADGE INTERACTION STYLES */}
      <style dangerouslySetInnerHTML={{__html: `
        .badge-pending { background-color: #fff7ed; color: #ea580c; }
        .badge-approved { background-color: #e0f2fe; color: #0284c7; }
        .badge-completed { background-color: #dcfce7; color: #16a34a; }
        .badge-cancelled { background-color: #fee2e2; color: #dc2626; }
        .apt-icon-btn:hover { background-color: #f1f5f9; color: #0f172a; }
        .apt-row-hover:hover { background-color: #f8fafc; }
      `}} />

      {/* HEADER ACTION CONTROLS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" }}>Appointments</h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Manage all customer appointments and schedules.</p>
        </div>
        
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: "6px", backgroundColor: "#ffffff", fontSize: "14px", fontWeight: "500", color: "#334155", cursor: "pointer" }}>
            <Filter size={16} /> Filter
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: "6px", backgroundColor: "#ffffff", fontSize: "14px", fontWeight: "500", color: "#334155", cursor: "pointer" }}>
            <Download size={16} /> Export
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: "8px", border: "none", padding: "8px 16px", borderRadius: "6px", backgroundColor: "#14321a", fontSize: "14px", fontWeight: "500", color: "#ffffff", cursor: "pointer" }}>
            <Plus size={16} /> Add Appointment
          </button>
        </div>
      </div>

      {/* METRICS ROW CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "24px" }}>
        
        {/* TOTAL APPOINTMENTS */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Calendar size={20} color="#16a34a" />
              </div>
              <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Total Appointments</span>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "12px 0 4px 0" }}>{stats.total}</h2>
            <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>+0% <span style={{ color: "#94a3b8", fontWeight: "400" }}>vs last 7 days</span></span>
          </div>
          <svg width="60" height="30" viewBox="0 0 60 30" fill="none"><path d="M2 28L15 18L30 24L58 2" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>

        {/* PENDING APPOINTMENTS */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={20} color="#ea580c" />
              </div>
              <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Pending Appointments</span>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "12px 0 4px 0" }}>{stats.pending}</h2>
            <span style={{ fontSize: "12px", color: "#ea580c", fontWeight: "600" }}>+0% <span style={{ color: "#94a3b8", fontWeight: "400" }}>vs last 7 days</span></span>
          </div>
          <svg width="60" height="30" viewBox="0 0 60 30" fill="none"><path d="M2 25L18 20L35 28L58 5" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>

        {/* COMPLETED APPOINTMENTS */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={20} color="#2563eb" />
              </div>
              <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Completed Appointments</span>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "12px 0 4px 0" }}>{stats.completed}</h2>
            <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: "600" }}>+0% <span style={{ color: "#94a3b8", fontWeight: "400" }}>vs last 7 days</span></span>
          </div>
          <svg width="60" height="30" viewBox="0 0 60 30" fill="none"><path d="M2 28L20 15L40 22L58 8" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>

        {/* CANCELLED APPOINTMENTS */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <XCircle size={18} color="#dc2626" />
              </div>
              <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Cancelled Appointments</span>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "12px 0 4px 0" }}>{stats.cancelled}</h2>
            <span style={{ fontSize: "12px", color: "#dc2626", fontWeight: "600" }}>+0% <span style={{ color: "#94a3b8", fontWeight: "400" }}>vs last 7 days</span></span>
          </div>
          <svg width="60" height="30" viewBox="0 0 60 30" fill="none"><path d="M2 26L15 28L35 12L58 2" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>

      </div>

      {/* INTERACTIVE FILTERS CONTROLLER DESK */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderTopLeftRadius: "12px", borderTopRightRadius: "12px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", borderBottom: "none" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input 
            type="text"
            placeholder="Search appointments by name, phone or code..."
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

      {/* CORE SCHEDULING SHEET GRID CONTAINER */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: "600" }}>
              <th style={{ padding: "16px", width: "40px" }}><input type="checkbox" style={{ cursor: "pointer" }} /></th>
              <th style={{ padding: "16px" }}>Appointment ID</th>
              <th style={{ padding: "16px" }}>Customer</th>
              <th style={{ padding: "16px" }}>Date</th>
              <th style={{ padding: "16px" }}>Time</th>
              <th style={{ padding: "16px" }}>Service / Purpose</th>
              <th style={{ padding: "16px" }}>Status</th>
              <th style={{ padding: "16px" }}>Created At</th>
            {/* <th style={{ padding: "16px", textAlign: "right" }}>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>No appointments matched your query filter bounds.</td>
              </tr>
            ) : (
              filteredAppointments.map((a) => (
                <tr key={a._id} className="apt-row-hover" style={{ borderBottom: "1px solid #f1f5f9", color: "#334155", transition: "background 0.2s" }}>
                  <td style={{ padding: "16px" }}><input type="checkbox" style={{ cursor: "pointer" }} /></td>
                  <td style={{ padding: "16px", fontWeight: "600", color: "#16a34a" }}>
                    {a.code ? `#${a.code}` : `#APT-${a._id.slice(-6).toUpperCase()}`}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: "600", color: "#0f172a" }}>{a.fullName}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{a.phone}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: "500", color: "#334155" }}>
                      {isNaN(Date.parse(a.date)) ? a.date : new Date(a.date).toLocaleDateString("en-GB")}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                      {isNaN(Date.parse(a.date)) ? "" : new Date(a.date).toLocaleDateString("en-US", { weekday: 'long' })}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: "500", color: "#334155" }}>{a.timeSlot}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>1 hour</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: "600", color: "#334155" }}>{a.purpose || "General Query"}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.message || "No comments listed"}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={`badge-${a.status || "pending"}`} style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", textTransform: "capitalize" }}>
                        {a.status === "approved" ? "Confirmed" : a.status || "pending"}
                      </span>
                      
                      <select
                        value={a.status || "pending"}
                        onChange={(e) => handleStatusChange(a._id, e.target.value)}
                        disabled={updatingId === a._id}
                        style={{ border: "none", backgroundColor: "transparent", cursor: "pointer", color: "#64748b", outline: "none", fontSize: "12px" }}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td style={{ padding: "16px", fontSize: "13px", color: "#475569" }}>
                    {new Date(a.createdAt).toLocaleDateString("en-GB")} {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  {/* <td style={{ padding: "16px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px", color: "#64748b" }}>
                      <button className="apt-icon-btn" style={{ border: "none", background: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", color: "inherit" }}><Eye size={16} /></button>
                      <button className="apt-icon-btn" style={{ border: "none", background: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", color: "inherit" }}><Edit3 size={16} /></button>
                      <button className="apt-icon-btn" style={{ border: "none", background: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", color: "inherit" }}><MoreVertical size={16} /></button>
                    </div>
                  </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* CONTROLLER SHEET FOOTER ROW */}
        <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", backgroundColor: "#ffffff", fontSize: "14px", color: "#64748b" }}>
          <span>Showing 1 to {filteredAppointments.length} of {filteredAppointments.length} appointments</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button style={{ border: "1px solid #e2e8f0", background: "#ffffff", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", color: "#94a3b8" }}><ChevronLeft size={16} /></button>
            <span style={{ width: "32px", height: "32px", borderRadius: "6px", backgroundColor: "#dcfce7", color: "#14321a", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>1</span>
            <button style={{ border: "1px solid #e2e8f0", background: "#ffffff", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", color: "#94a3b8" }}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* FOOTER WIDGET: UPCOMING SCHEDULE PROFILE BAR */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginTop: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", color: "#0f172a", marginBottom: "16px", fontSize: "16px" }}>
          <Calendar size={18} color="#7c3aed" /> Upcoming Appointments
        </div>

        {upcomingAppointment ? (
          <div style={{ border: "1px solid #f1f5f9", borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fafafa" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ backgroundColor: "#f3e8ff", color: "#7c3aed", borderRadius: "8px", padding: "8px 12px", textAlign: "center", fontWeight: "700", minWidth: "44px" }}>
                <div style={{ fontSize: "16px" }}>
                  {isNaN(Date.parse(upcomingAppointment.date)) ? "22" : new Date(upcomingAppointment.date).getDate()}
                </div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", marginTop: "2px" }}>
                  {isNaN(Date.parse(upcomingAppointment.date)) ? "Jul" : new Date(upcomingAppointment.date).toLocaleString("en-US", { month: "short" })}
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: "600", color: "#0f172a", fontSize: "15px" }}>{upcomingAppointment.fullName}</span>
                  <span className="badge-pending" style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: "600", textTransform: "capitalize" }}>
                    {upcomingAppointment.status}
                  </span>
                </div>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                  {upcomingAppointment.timeSlot} • <span style={{ color: "#475569" }}>{upcomingAppointment.purpose || "Device Consultation"}</span>
                </div>
              </div>
            </div>
            <button style={{ border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: "6px", backgroundColor: "#ffffff", fontSize: "13px", fontWeight: "600", color: "#334155", cursor: "pointer" }}>
              View Details
            </button>
          </div>
        ) : (
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>No dynamic pending queue requests processing currently.</p>
        )}
      </div>

    </div>
  );
}