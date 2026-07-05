"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

type AccountUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  addresses?: Address[];
} | null;

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [label, setLabel] = useState("Home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [message, setMessage] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/account/profile", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success || !data.user) {
        router.push("/auth/login?redirect=/account");
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error("ACCOUNT PAGE ERROR:", error);
      router.push("/auth/login?redirect=/account");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [router]);

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setLabel("Home");
    setFullName("");
    setPhone("");
    setAddressLine("");
    setCity("");
    setStateName("");
    setPincode("");
  };

  const handleEditClick = (address: Address) => {
    setEditingAddressId(address._id);
    setLabel(address.label || "Home");
    setFullName(address.fullName || "");
    setPhone(address.phone || "");
    setAddressLine(address.addressLine || "");
    setCity(address.city || "");
    setStateName(address.state || "");
    setPincode(address.pincode || "");
    setMessage("");
  };

  const handleSaveAddress = async () => {
    if (!fullName || !phone || !addressLine || !city || !stateName || !pincode) {
      setMessage("Please fill all address fields.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const url = editingAddressId
        ? `/api/account/addresses/${editingAddressId}`
        : "/api/account/addresses";

      const method = editingAddressId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label,
          fullName,
          phone,
          addressLine,
          city,
          state: stateName,
          pincode,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Failed to save address");
        return;
      }

      setMessage(editingAddressId ? "Address updated successfully" : "Address added successfully");
      resetAddressForm();
      await fetchProfile();
    } catch (error) {
      console.error("SAVE ADDRESS PAGE ERROR:", error);
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to delete address");
        return;
      }

      if (editingAddressId === id) {
        resetAddressForm();
      }

      await fetchProfile();
    } catch (error) {
      console.error("DELETE ADDRESS PAGE ERROR:", error);
      alert("Something went wrong");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}/default`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to set default address");
        return;
      }

      await fetchProfile();
    } catch (error) {
      console.error("DEFAULT ADDRESS PAGE ERROR:", error);
      alert("Something went wrong");
    }
  };

  if (loading) {
    return <p className="text-center text-slate-400 font-medium py-16">Loading account...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <section className="bg-slate-50 min-h-screen px-4 py-8 md:px-12 flex justify-center font-sans text-black">
      <div className="w-full max-w-[1200px] flex flex-col gap-8">
        
        {/* ================= ACCOUNT HERO PAGE HEADER ================= */}
        <div className="flex justify-between items-start w-full">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">My Account</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your profile, orders, and saved addresses.</p>
          </div>
          <button 
            type="button" 
            className="flex items-center gap-1.5 border border-[#e11d48] text-[#e11d48] font-semibold text-xs px-4 py-2 rounded-xl bg-white hover:bg-rose-50 transition-colors duration-150"
          >
            <span>📝</span> Edit Profile
          </button>
        </div>

        {/* ================= CORE PROFILE SUMMARY ELEMENT CARD ================= */}
        <div className="border border-slate-200 rounded-[24px] p-6 md:p-8 bg-white flex flex-col gap-6 shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            <span className="text-[#e11d48] text-base">👤</span> Account Information
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#f8fafc] border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]">👤</div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Full Name</span>
                <strong className="text-sm font-bold text-slate-800">{user.name}</strong>
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]">✉️</div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Email</span>
                <strong className="text-sm font-bold text-slate-800 truncate max-w-[180px]">{user.email}</strong>
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]">🛡️</div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Role</span>
                <strong className="text-sm font-bold text-slate-800 capitalize">{user.role}</strong>
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]">🔑</div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Account ID</span>
                <strong className="text-xs font-mono font-bold text-slate-600 truncate max-w-[180px]">{user._id}</strong>
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]">📅</div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Joined</span>
                <strong className="text-sm font-bold text-slate-800">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* ================= QUICK ACTIONS DISPATCH CARDS GRID ================= */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-800 m-0 tracking-tight">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/account/appointments" className="group border border-slate-200 rounded-2xl p-5 bg-white flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-slate-300 transition-all duration-150">
              <div className="flex items-center gap-3.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">📅</div>
                <span className="text-sm font-semibold text-slate-700">View Appointments</span>
              </div>
              <span className="text-slate-400 group-hover:text-slate-600 transition-transform duration-150 group-hover:translate-x-0.5">➔</span>
            </Link>

            <Link href="/account/orders" className="group border border-slate-200 rounded-2xl p-5 bg-white flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-slate-300 transition-all duration-150">
              <div className="flex items-center gap-3.5">
                <div className="h-9 w-9 rounded-xl bg-rose-50 text-[#e11d48] flex items-center justify-center text-sm">🛍️</div>
                <span className="text-sm font-semibold text-slate-700">View Order History</span>
              </div>
              <span className="text-slate-400 group-hover:text-slate-600 transition-transform duration-150 group-hover:translate-x-0.5">➔</span>
            </Link>

            <Link href="/products" className="group border border-slate-200 rounded-2xl p-5 bg-white flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-slate-300 transition-all duration-150">
              <div className="flex items-center gap-3.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">🛒</div>
                <span className="text-sm font-semibold text-slate-700">Continue Shopping</span>
              </div>
              <span className="text-slate-400 group-hover:text-slate-600 transition-transform duration-150 group-hover:translate-x-0.5">➔</span>
            </Link>

            {user.role === "admin" && (
              <Link href="/admin" className="group border border-slate-200 rounded-2xl p-5 bg-white flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-slate-300 transition-all duration-150">
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm">🛡️</div>
                  <span className="text-sm font-semibold text-slate-700">Open Admin Panel</span>
                </div>
                <span className="text-slate-400 group-hover:text-slate-600 transition-transform duration-150 group-hover:translate-x-0.5">➔</span>
              </Link>
            )}
          </div>
        </div>

        {/* ================= SAVED ADDRESSES CONTEXT MODULE ================= */}
        <div className="border border-slate-200 rounded-[24px] p-6 md:p-8 bg-white flex flex-col gap-6 shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-lg font-bold text-slate-800 m-0 tracking-tight">Saved Addresses</h2>
            {!editingAddressId && (
              <a href="#address-form-block" className="bg-[#e11d48] hover:bg-[#c2143a] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-sm flex items-center gap-1">
                <span>+</span> Add New Address
              </a>
            )}
          </div>

          {user.addresses && user.addresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.addresses.map((address) => (
                <div className="border border-slate-200 rounded-2xl p-5 bg-white flex flex-col justify-between group shadow-sm" key={address._id}>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        {address.label || "Address"}
                        {address.isDefault && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </strong>
                    </div>

                    <p className="text-xs font-semibold text-slate-700">{address.fullName}</p>
                    <p className="text-xs text-slate-500">{address.phone}</p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{address.addressLine}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-5 border-t border-slate-100 pt-3">
                    <button type="button" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors duration-150" onClick={() => handleEditClick(address)}>
                      Edit
                    </button>
                    {!address.isDefault && (
                      <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-150 ml-auto" onClick={() => handleSetDefault(address._id)}>
                        Set Default
                      </button>
                    )}
                    <button type="button" className={`text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors duration-150 ${address.isDefault ? "ml-auto" : ""}`} onClick={() => handleDeleteAddress(address._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY FALLBACK VIEW */
            <div className="flex flex-col items-center text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center text-2xl mb-4 shadow-inner">📍</div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No saved addresses yet</h3>
              <p className="text-xs text-slate-400 max-w-[280px] mb-5 font-medium">Add a new address to make your checkout faster and easier.</p>
              <a href="#address-form-block" className="border border-[#e11d48] text-[#e11d48] font-bold text-xs px-5 py-2.5 rounded-xl bg-white hover:bg-rose-50 transition-colors duration-150 shadow-sm">
                Add New Address
              </a>
            </div>
          )}
        </div>

        {/* ================= DATA SUBMISSION FORM INTERFACE PANEL ================= */}
        <div id="address-form-block" className="border border-slate-200 rounded-[24px] p-6 md:p-8 bg-white flex flex-col gap-6 shadow-[0_4px_25px_rgba(0,0,0,0.01)] scroll-mt-6">
          <h2 className="text-lg font-bold text-slate-800 m-0 tracking-tight">
            {editingAddressId ? "Edit Address Parameters" : "Add New Address"}
          </h2>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Address Label</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Home / Office / Hostel"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-500 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Receiver Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-500 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-500 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Address Lines</label>
              <textarea
                rows={3}
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="House no, street, locality, landmark"
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-500 bg-white placeholder:text-slate-400 font-medium resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-500 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">State</label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Enter state"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-500 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter pincode"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-slate-500 bg-white placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {message && (
              <p className={`text-xs font-semibold ${message.includes("successfully") ? "text-emerald-600" : "text-rose-500"}`}>
                {message}
              </p>
            )}

            <div className="flex justify-end gap-3.5 mt-4 border-t border-slate-100 pt-5">
              {editingAddressId && (
                <button
                  type="button"
                  onClick={resetAddressForm}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors duration-150 active:scale-95"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveAddress}
                disabled={saving}
                className="rounded-xl bg-[#e11d48] hover:bg-[#c2143a] text-white px-6 py-2.5 text-xs font-bold tracking-wide transition-colors duration-150 disabled:bg-slate-200 shadow-sm active:scale-95"
              >
                {saving ? "Saving..." : editingAddressId ? "Update Address" : "Add Address"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}