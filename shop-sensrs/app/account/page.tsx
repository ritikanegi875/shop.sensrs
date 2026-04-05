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
    return <p className="empty-admin-records">Loading account...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <section className="account-page">
      <div className="account-card">
        <div className="account-header">
          <h1>My Account</h1>
          <p>Manage your profile, orders, and saved addresses.</p>
        </div>

        <div className="account-info-grid">
          <div className="account-info-box">
            <span>Full Name</span>
            <strong>{user.name}</strong>
          </div>

          <div className="account-info-box">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div className="account-info-box">
            <span>Role</span>
            <strong>{user.role}</strong>
          </div>

          <div className="account-info-box">
            <span>Account ID</span>
            <strong>{user._id}</strong>
          </div>

          <div className="account-info-box">
            <span>Joined</span>
            <strong>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-IN")
                : "N/A"}
            </strong>
          </div>
        </div>

        <div className="account-actions">
          <Link href="/account/orders" className="primary-btn">
            View Order History
          </Link>

          <Link href="/products" className="secondary-btn">
            Continue Shopping
          </Link>

          {user.role === "admin" && (
            <Link href="/admin" className="secondary-btn">
              Open Admin Panel
            </Link>
          )}
        </div>

        <div className="account-address-section">
          <h2>Saved Addresses</h2>

          {user.addresses && user.addresses.length > 0 ? (
            <div className="account-address-grid">
              {user.addresses.map((address) => (
                <div className="account-address-card" key={address._id}>
                  <div className="account-address-top">
                    <strong>
                      {address.label || "Address"}
                      {address.isDefault ? " • Default" : ""}
                    </strong>
                  </div>

                  <p>{address.fullName}</p>
                  <p>{address.phone}</p>
                  <p>{address.addressLine}</p>
                  <p>
                    {address.city}, {address.state} - {address.pincode}
                  </p>

                  <div className="account-address-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleEditClick(address)}
                    >
                      Edit
                    </button>

                    {!address.isDefault && (
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => handleSetDefault(address._id)}
                      >
                        Set Default
                      </button>
                    )}

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDeleteAddress(address._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-admin-records">No saved addresses yet.</p>
          )}
        </div>

        <div className="account-address-section">
          <h2>{editingAddressId ? "Edit Address" : "Add New Address"}</h2>

          <div className="account-address-form">
            <div className="form-group">
              <label>Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Home / Office / Hostel"
              />
            </div>

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
              <label>Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone"
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

            {message && <p className="auth-message full-width">{message}</p>}

            <div className="form-actions account-form-actions">
              {editingAddressId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetAddressForm}
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                className="primary-btn"
                onClick={handleSaveAddress}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingAddressId
                  ? "Update Address"
                  : "Add Address"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}