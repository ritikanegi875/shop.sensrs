"use client";

import { useEffect, useState } from "react";

type AppointmentRecord = {
  _id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  purpose: string;
  date: string;
  timeSlot: string;
  notes: string;
  createdAt: string;
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/appointments", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        console.log("APPOINTMENTS API RESPONSE:", data);

        if (!res.ok || !data.success) {
          setError(data.message || "Failed to fetch appointments");
          return;
        }

        setAppointments(data.appointments || []);
      } catch (err) {
        console.error("FETCH APPOINTMENTS ERROR:", err);
        setError("Something went wrong while fetching appointments");
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, []);

  return (
    <section className="admin-records-page">
      <div className="admin-records-header">
        <h1>Appointment Records</h1>
        <p>All database appointment submissions are listed here.</p>
      </div>

      {loading ? (
        <p className="empty-admin-records">Loading appointments...</p>
      ) : error ? (
        <p className="empty-admin-records">{error}</p>
      ) : appointments.length === 0 ? (
        <p className="empty-admin-records">No appointment records found.</p>
      ) : (
        <div className="admin-records-list">
          {appointments.map((appointment) => (
            <div className="admin-record-card" key={appointment._id}>
              <div className="admin-record-top">
                <h2>{appointment.code}</h2>
                <span className="record-badge appointment-badge">
                  APPOINTMENT
                </span>
              </div>

              <div className="admin-record-grid">
                <p><strong>Name:</strong> {appointment.fullName}</p>
                <p><strong>Email:</strong> {appointment.email}</p>
                <p><strong>Phone:</strong> {appointment.phone}</p>
                <p><strong>Date:</strong> {appointment.date}</p>
                <p><strong>Time Slot:</strong> {appointment.timeSlot}</p>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(appointment.createdAt).toLocaleString("en-IN")}
                </p>
                <p className="full-row">
                  <strong>Purpose:</strong> {appointment.purpose}
                </p>
                <p className="full-row">
                  <strong>Notes:</strong> {appointment.notes || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}