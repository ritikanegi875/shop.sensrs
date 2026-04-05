"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Address = {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

type ProfileUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  addresses?: Address[];
};

export default function AppointmentPage() {
  const router = useRouter();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);

  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [message, setMessage] = useState("");

  const fillAddressFields = (address: Address, fallbackEmail?: string) => {
    setFullName(address.fullName || "");
    setPhone(address.phone || "");
    setAddressLine(address.addressLine || "");
    setCity(address.city || "");
    setStateName(address.state || "");
    setPincode(address.pincode || "");
    if (fallbackEmail) setEmail(fallbackEmail);
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/account/profile", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!data.success || !data.user) {
          router.push("/auth/login?redirect=/appointments");
          return;
        }

        const fetchedUser = data.user as ProfileUser;
        setUser(fetchedUser);
        setEmail(fetchedUser.email || "");

        if (fetchedUser.addresses && fetchedUser.addresses.length > 0) {
          const defaultAddress =
            fetchedUser.addresses.find((address) => address.isDefault) ||
            fetchedUser.addresses[0];

          setSelectedAddressId(defaultAddress._id);
          fillAddressFields(defaultAddress, fetchedUser.email);
        }
      } catch (error) {
        console.error("APPOINTMENT PROFILE ERROR:", error);
        router.push("/auth/login?redirect=/appointments");
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchProfile();
  }, [router]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);

    const selected = user?.addresses?.find((a) => a._id === addressId);
    if (selected) {
      fillAddressFields(selected, user?.email || "");
    }
  };

  const handleSubmit = async () => {
    if (
      !fullName ||
      !email ||
      !phone ||
      !addressLine ||
      !city ||
      !stateName ||
      !pincode ||
      !date ||
      !timeSlot
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          addressLine,
          city,
          state: stateName,
          pincode,
          date,
          timeSlot,
          message,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Appointment booked successfully!");
        router.push("/account");
      } else {
        alert(data.message || "Booking failed");
      }
    } catch (error) {
      console.error("APPOINTMENT BOOKING ERROR:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return <p className="empty-admin-records">Loading appointment form...</p>;
  }

  return (
    <section className="checkout-form-page">
      <div className="checkout-form-header">
        <h1>Book Appointment</h1>
        <p>Choose a saved address or enter details manually.</p>
      </div>

      {user?.addresses && user.addresses.length > 0 && (
        <div className="saved-address-picker">
          <h2>Choose Saved Address</h2>
          <div className="saved-address-list">
            {user.addresses.map((address) => (
              <button
                key={address._id}
                type="button"
                className={`saved-address-item ${
                  selectedAddressId === address._id ? "active" : ""
                }`}
                onClick={() => handleAddressSelect(address._id)}
              >
                <strong>{address.label || "Address"}</strong>
                <p>{address.fullName}</p>
                <p>{address.phone}</p>
                <p>{address.addressLine}</p>
                <p>
                  {address.city}, {address.state} - {address.pincode}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="checkout-form appointment-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter full name"
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
          />
        </div>

        <div className="form-group full-width">
          <label>Address Line</label>
          <textarea
            rows={4}
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            placeholder="House no, street, locality, landmark"
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city"
          />
        </div>

        <div className="form-group">
          <label>State</label>
          <input
            type="text"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            placeholder="Enter state"
          />
        </div>

        <div className="form-group">
          <label>Pincode</label>
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Enter pincode"
          />
        </div>

        <div className="form-group">
          <label>Appointment Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Time Slot</label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
          >
            <option value="">Select time slot</option>
            <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
            <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
            <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
            <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
            <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>Message / Notes</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add any note for the appointment"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </div>
    </section>
  );
}