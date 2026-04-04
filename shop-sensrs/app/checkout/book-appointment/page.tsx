"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { generateAppointmentCode } from "@/lib/checkout-storage";

function generateTimeSlots() {
  const slots: string[] = [];
  const startHour = 10;
  const endHour = 17;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 20) {
      const start = new Date();
      start.setHours(hour, minute, 0, 0);

      const end = new Date();
      end.setHours(hour, minute + 20, 0, 0);

      const format = (date: Date) =>
        date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

      slots.push(`${format(start)} - ${format(end)}`);
    }
  }

  return slots;
}

export default function BookAppointmentPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const allSlots = useMemo(() => generateTimeSlots(), []);

  useEffect(() => {
    async function fetchBookedSlots() {
      if (!date) {
        setBookedSlots([]);
        return;
      }

      try {
        setSlotsLoading(true);

        const res = await fetch(
          `/api/appointments/slots?date=${encodeURIComponent(date)}`
        );
        const data = await res.json();

        if (data.success) {
          setBookedSlots(data.bookedSlots || []);
        } else {
          setBookedSlots([]);
        }
      } catch (error) {
        console.error(error);
        setBookedSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }

    fetchBookedSlots();
  }, [date]);

  const availableSlots = allSlots.filter(
    (slot) => !bookedSlots.includes(slot)
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!date || !timeSlot) {
      setError("Please select date and time slot.");
      return;
    }

    setLoading(true);

    const code = generateAppointmentCode();

    const payload = {
      type: "BOOK_APPOINTMENT",
      code,
      fullName,
      email,
      phone,
      purpose,
      date,
      timeSlot,
      notes,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push(
        `/checkout/success?type=appointment&code=${encodeURIComponent(code)}`
      );
    } catch (err) {
      setError("Server error. Try again.");
      setLoading(false);
    }
  };

  return (
    <section className="checkout-form-page">
      <div className="checkout-form-header">
        <h1>Book an Appointment</h1>
        <p>Select your details, date, and available 20-minute slot.</p>
      </div>

      <form
        className="checkout-form appointment-form"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Appointment Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setTimeSlot("");
            }}
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Purpose</label>
          <textarea
            rows={4}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Available Time Slot</label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            required
            disabled={!date || slotsLoading}
          >
            <option value="">
              {!date
                ? "Select date first"
                : slotsLoading
                ? "Loading slots..."
                : availableSlots.length > 0
                ? "Select a time slot"
                : "No slots available"}
            </option>

            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group full-width">
          <label>Additional Notes</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Processing..." : "Confirm Appointment"}
          </button>
        </div>
      </form>
    </section>
  );
}