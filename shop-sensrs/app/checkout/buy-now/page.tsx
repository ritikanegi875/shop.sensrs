"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
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

export default function BuyNowPage() {
  const { cartItems, clearCart } = useCart();
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

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
          router.push("/auth/login?redirect=/checkout/buy-now");
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
        console.error("BUY NOW PROFILE ERROR:", error);
        router.push("/auth/login?redirect=/checkout/buy-now");
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

  const handleOrder = async () => {
    if (
      !fullName ||
      !email ||
      !phone ||
      !addressLine ||
      !city ||
      !stateName ||
      !pincode
    ) {
      alert("Please fill all fields");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/orders", {
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
          items: cartItems,
          totalPrice,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Order placed successfully!");
        clearCart();
        router.push("/account/orders");
      } else {
        alert(data.message || "Order failed");
      }
    } catch (error) {
      console.error("ORDER ERROR:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return <p className="empty-admin-records">Loading checkout...</p>;
  }

  return (
    <section className="buy-now-page">
      <div className="buy-now-card">
        <h1>Checkout</h1>
        <p className="buy-now-login-text">
          Logged in as: {email || user?.email || "User"}
        </p>

        {cartItems.length === 0 ? (
          <p className="empty-admin-records">Your cart is empty.</p>
        ) : (
          <>
            <div className="buy-now-summary">
              <h2>Order Summary</h2>
              <div className="checkout-items">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="checkout-item">
                    <div>
                      <strong>{item.title}</strong>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <span>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <h3 className="buy-now-total">
                Total: ₹{totalPrice.toLocaleString("en-IN")}
              </h3>
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

            <div className="buy-now-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
                  placeholder="House no, street, area, landmark"
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

              <button
                type="button"
                className="primary-btn buy-now-btn"
                onClick={handleOrder}
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}