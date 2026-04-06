"use client";

import { useEffect, useMemo, useState } from "react";

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
      const res = await fetch("/api/appointments", {
        cache: "no-store",
      });

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (data.success) {
        setAppointments((prev) =>
          prev.map((a) =>
            a._id === id ? { ...a, status } : a
          )
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

  const filteredAppointments = useMemo(() => {
    const q = search.toLowerCase().trim();

    return appointments.filter((a) => {
      const matchesStatus =
        statusFilter === "all" ? true : a.status === statusFilter;

      const matchesSearch =
        !q ||
        a.fullName?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.code?.toLowerCase().includes(q) ||
        a._id.slice(-6).toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [appointments, search, statusFilter]);

  if (loading) {
    return <p className="empty-admin-records">Loading appointments...</p>;
  }

  return (
    <section className="admin-records-page">
      <div className="admin-records-header">
        <h1>Appointments</h1>
        <p>Search, filter and manage appointment requests.</p>
      </div>

      <div className="admin-filters-bar">
        <input
          type="text"
          placeholder="Search by name, email, or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-filter-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-filter-select"
        >
          <option value="all">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {filteredAppointments.length === 0 ? (
        <p className="empty-admin-records">No appointments found.</p>
      ) : (
        <div className="admin-records-list">
          {filteredAppointments.map((a) => (
            <div className="admin-record-card" key={a._id}>
              <div className="admin-record-top">
                <div>
                  <h2>
                    Appointment{" "}
                    {a.code
                      ? `#${a.code}`
                      : `#${a._id.slice(-6).toUpperCase()}`}
                  </h2>
                  <p>{new Date(a.createdAt).toLocaleString("en-IN")}</p>
                </div>

                <div className="admin-order-status-box">
                  <span
                    className={`record-badge ${
                      a.status === "completed"
                        ? "status-delivered"
                        : a.status === "approved"
                        ? "status-confirmed"
                        : a.status === "cancelled"
                        ? "status-cancelled"
                        : "status-pending"
                    }`}
                  >
                    {a.status || "pending"}
                  </span>

                  <select
                    value={a.status || "pending"}
                    onChange={(e) =>
                      handleStatusChange(a._id, e.target.value)
                    }
                    disabled={updatingId === a._id}
                    className="admin-status-select"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-record-grid">
                <p><strong>Name:</strong> {a.fullName}</p>
                <p><strong>Email:</strong> {a.email}</p>
                <p><strong>Phone:</strong> {a.phone}</p>
                <p><strong>Date:</strong> {a.date}</p>
                <p><strong>Time Slot:</strong> {a.timeSlot}</p>
                <p>
                  <strong>Purpose:</strong>{" "}
                  {a.purpose || a.message || "General"}
                </p>

                {(a.addressLine || a.city || a.state) && (
                  <p className="full-row">
                    <strong>Address:</strong> {a.addressLine}, {a.city},{" "}
                    {a.state} - {a.pincode}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}