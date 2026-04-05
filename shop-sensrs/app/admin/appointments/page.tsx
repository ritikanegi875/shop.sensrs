"use client";

import { useEffect, useState } from "react";

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
      console.error("ADMIN APPOINTMENTS FETCH ERROR:", error);
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
          prev.map((appointment) =>
            appointment._id === id ? { ...appointment, status } : appointment
          )
        );
      } else {
        alert(data.message || "Failed to update appointment status");
      }
    } catch (error) {
      console.error("APPOINTMENT STATUS UPDATE ERROR:", error);
      alert("Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p className="empty-admin-records">Loading appointments...</p>;
  }

  return (
    <section className="admin-records-page">
      <div className="admin-records-header">
        <h1>Appointments</h1>
        <p>Manage appointment requests and update booking status.</p>
      </div>

      {appointments.length === 0 ? (
        <p className="empty-admin-records">No appointments found.</p>
      ) : (
        <div className="admin-records-list">
          {appointments.map((appointment) => (
            <div className="admin-record-card" key={appointment._id}>
              <div className="admin-record-top">
                <div>
                  <h2>
                    Appointment{" "}
                    {appointment.code
                      ? `#${appointment.code}`
                      : `#${appointment._id.slice(-6).toUpperCase()}`}
                  </h2>
                  <p>
                    {new Date(appointment.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="admin-order-status-box">
                  <span className="record-badge appointment-badge">
                    {appointment.status || "pending"}
                  </span>

                  <select
                    value={appointment.status || "pending"}
                    onChange={(e) =>
                      handleStatusChange(appointment._id, e.target.value)
                    }
                    disabled={updatingId === appointment._id}
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
                  <strong>Name:</strong> {appointment.fullName}
                </p>
                <p>
                  <strong>Email:</strong> {appointment.email}
                </p>
                <p>
                  <strong>Phone:</strong> {appointment.phone}
                </p>
                <p>
                  <strong>Date:</strong> {appointment.date}
                </p>
                <p>
                  <strong>Time Slot:</strong> {appointment.timeSlot}
                </p>
                <p>
                  <strong>Purpose:</strong>{" "}
                  {appointment.purpose || appointment.message || "General Appointment"}
                </p>

                {(appointment.addressLine ||
                  appointment.city ||
                  appointment.state ||
                  appointment.pincode) && (
                  <p className="full-row">
                    <strong>Address:</strong> {appointment.addressLine || ""}
                    {appointment.addressLine ? ", " : ""}
                    {appointment.city || ""}
                    {appointment.city ? ", " : ""}
                    {appointment.state || ""}{" "}
                    {appointment.pincode ? `- ${appointment.pincode}` : ""}
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