"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function AccountAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await fetch("/api/appointments/my-appointments", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!data.success) {
          router.push("/auth/login?redirect=/account/appointments");
          return;
        }

        setAppointments(data.appointments || []);
      } catch (error) {
        console.error("ACCOUNT APPOINTMENTS ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [router]);

  if (loading) {
    return <p className="empty-admin-records">Loading appointments...</p>;
  }

  return (
    <section className="account-orders-page">
      <div className="account-orders-header">
        <h1>My Appointments</h1>
        <p>Track your booked appointments and their status.</p>
      </div>

      {appointments.length === 0 ? (
        <p className="empty-admin-records">No appointments found.</p>
      ) : (
        <div className="account-orders-list">
          {appointments.map((appointment) => (
            <div className="account-order-card" key={appointment._id}>
              <div className="account-order-top">
                <div>
                  <h2>
                    Appointment{" "}
                    {appointment.code
                      ? `#${appointment.code}`
                      : `#${appointment._id.slice(-6).toUpperCase()}`}
                  </h2>
                  <p>{new Date(appointment.createdAt).toLocaleString("en-IN")}</p>
                </div>

                <span
                  className={`record-badge ${
                    appointment.status === "completed"
                      ? "status-delivered"
                      : appointment.status === "approved"
                      ? "status-confirmed"
                      : appointment.status === "cancelled"
                      ? "status-cancelled"
                      : "status-pending"
                  }`}
                >
                  {appointment.status || "pending"}
                </span>
              </div>

              <div className="account-order-grid">
                <p><strong>Name:</strong> {appointment.fullName}</p>
                <p><strong>Email:</strong> {appointment.email}</p>
                <p><strong>Phone:</strong> {appointment.phone}</p>
                <p><strong>Date:</strong> {appointment.date}</p>
                <p><strong>Time Slot:</strong> {appointment.timeSlot}</p>
                <p>
                  <strong>Purpose:</strong>{" "}
                  {appointment.purpose || appointment.message || "General Appointment"}
                </p>
                <p className="full-row">
                  <strong>Address:</strong> {appointment.addressLine || ""}, {appointment.city || ""}, {appointment.state || ""} {appointment.pincode ? `- ${appointment.pincode}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}