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
    return <p className="text-center text-slate-400 font-medium py-16">Loading appointment form...</p>;
  }

  return (
    <section className="bg-white min-h-screen px-4 py-8 md:px-12 flex flex-col items-center font-sans text-black">
      <div className="w-full max-w-[900px]">
        
        {/* CHECKOUT HEADER SYSTEM */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight mb-1">Book Appointment</h1>
          <p className="text-sm text-slate-600 font-medium">Choose a saved address or enter details manually.</p>
        </div>

        {/* DYNAMIC SAVED ADDRESS SLIDER PICKER */}
        {user?.addresses && user.addresses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Choose Saved Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.addresses.map((address) => (
                <button
                  key={address._id}
                  type="button"
                  onClick={() => handleAddressSelect(address._id)}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-150 bg-white ${
                    selectedAddressId === address._id 
                      ? "border-[#e11d48] ring-1 ring-[#e11d48]" 
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <strong className="text-sm font-bold text-slate-900 mb-1">{address.label || "Address"}</strong>
                  <p className="text-xs text-slate-600 font-medium">{address.fullName}</p>
                  <p className="text-xs text-slate-600 font-medium">{address.phone}</p>
                  <p className="text-xs text-slate-500 mt-1">{address.addressLine}</p>
                  <p className="text-xs text-slate-500">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAIN METADATA FORM WRAPPER BOX */}
        <div className="border border-slate-400 rounded-[28px] p-6 md:p-10 bg-white flex flex-col gap-5">
          
          {/* Row 1: Full Name & Email Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-900">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-900">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Row 2: Phone Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-900">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Row 3: Full-width Address Line */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-slate-900">Address Line</label>
            <textarea
              rows={3}
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="House no, street, locality, landmark"
              className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium resize-y"
            />
          </div>

          {/* Row 4: City & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-900">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
                className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-900">State</label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="Enter state"
                className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Row 5: Pincode & Appointment Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-900">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter pincode"
                className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-900">Appointment Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white text-slate-700 font-medium cursor-pointer min-h-[42px]"
              />
            </div>
          </div>

          {/* Row 6: Time Slot Picker Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-900">Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white text-slate-700 font-medium cursor-pointer min-h-[42px]"
              >
                <option value="">Select time slot</option>
                <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
                <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
                <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
              </select>
            </div>
          </div>

          {/* Row 7: Full-width Message / Notes Area */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-slate-900">Message / Notes</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add any note for the appointment"
              className="w-full border border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-700 bg-white placeholder:text-slate-400 font-medium resize-y"
            />
          </div>

          {/* SUBMISSION FOOTER ACTION BUTTON */}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-xl bg-[#e11d48] hover:bg-[#c2143a] text-white px-6 py-3 text-center text-sm font-semibold tracking-wide transition-colors duration-150 disabled:bg-slate-300 active:scale-95 shadow-sm"
            >
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}