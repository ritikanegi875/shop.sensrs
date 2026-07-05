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
    return <p className="text-center text-slate-400 font-medium py-16">Loading appointments...</p>;
  }

  return (
    <section className="bg-slate-50 min-h-screen px-4 py-8 md:px-12 flex justify-center font-sans text-black">
      <div className="w-full max-w-[1200px] flex flex-col gap-8">
        
        {/* HEADER AREA */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1">My Appointments</h1>
          <p className="text-sm text-slate-500 font-medium">Track your booked appointments and their status.</p>
        </div>

        {appointments.length === 0 ? (
          <p className="text-center text-slate-400 font-medium py-12 bg-white rounded-2xl border border-slate-200">
            No appointments found.
          </p>
        ) : (
          /* APPOINTMENTS LIST CONTAINER */
          <div className="flex flex-col gap-6">
            {appointments.map((appointment) => (
              <div 
                className="border border-slate-200 rounded-[24px] p-6 md:p-8 bg-white flex flex-col gap-6 shadow-[0_4px_25px_rgba(0,0,0,0.01)]" 
                key={appointment._id}
              >
                {/* CARD TOP BAR CONFIGURATION */}
                <div className="flex justify-between items-start w-full border-b border-slate-100 pb-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-serif text-2xl font-normal text-[#00241b] m-0">
                      Appointment{" "}
                      {appointment.code
                        ? `#${appointment.code}`
                        : `#${appointment._id.slice(-6).toUpperCase()}`}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      {new Date(appointment.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* SEMANTIC PILL BADGES MAPPED TO SYSTEM STATE RULES */}
                  <span
                    className={`rounded px-3 py-1 text-[10px] font-bold tracking-wide uppercase border ${
                      appointment.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : appointment.status === "approved"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                        : appointment.status === "cancelled"
                        ? "bg-rose-50 text-rose-700 border-rose-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}
                  >
                    {appointment.status || "pending"}
                  </span>
                </div>

                {/* SPECIFICATIONS METRICS DETAIL GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm text-slate-600">
                  <p className="leading-relaxed"><strong className="text-slate-800 font-semibold">Name:</strong> {appointment.fullName}</p>
                  <p className="leading-relaxed break-all"><strong className="text-slate-800 font-semibold">Email:</strong> {appointment.email}</p>
                  <p className="leading-relaxed"><strong className="text-slate-800 font-semibold">Phone:</strong> {appointment.phone}</p>
                  <p className="leading-relaxed"><strong className="text-slate-800 font-semibold">Date:</strong> {appointment.date}</p>
                  <p className="leading-relaxed"><strong className="text-slate-800 font-semibold">Time Slot:</strong> {appointment.timeSlot}</p>
                  <p className="leading-relaxed md:col-span-2">
                    <strong className="text-slate-800 font-semibold">Purpose:</strong>{" "}
                    {appointment.purpose || appointment.message || "General Appointment"}
                  </p>
                  <p className="leading-relaxed sm:col-span-2 md:col-span-3">
                    <strong className="text-slate-800 font-semibold">Address:</strong> {appointment.addressLine || ""}{appointment.city ? `, ${appointment.city}` : ""}{appointment.state ? `, ${appointment.state}` : ""}{appointment.pincode ? ` - ${appointment.pincode}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}