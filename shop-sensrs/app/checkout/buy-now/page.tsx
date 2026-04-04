"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { generateBuyNowCode } from "@/lib/checkout-storage";

export default function BuyNowPage() {
  const router = useRouter();
  const { cartItems } = useCart();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    setLoading(true);

    const code = generateBuyNowCode();

    const payload = {
      type: "BUY_NOW",
      code,
      fullName,
      email,
      phone,
      address,
      city,
      state: stateName,
      pincode,
      notes,
      items: cartItems,
      totalPrice,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push(`/checkout/success?type=buy-now&code=${code}`);
    } catch (err) {
      alert("Server error. Try again.");
      setLoading(false);
    }
  };

  return (
    <section className="checkout-form-page">
      <div className="checkout-form-header">
        <h1>Buy Now</h1>
        <p>Fill in your order details.</p>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
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

          <div className="form-group full-width">
            <label>Address</label>
            <textarea
              rows={4}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Pincode</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Additional Notes</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Processing..." : "Confirm Buy Now"}
            </button>
          </div>
        </form>

        <div className="checkout-summary">
          <h2>Order Summary</h2>

          {cartItems.length === 0 ? (
            <p className="muted-text">Your cart is empty.</p>
          ) : (
            <div className="summary-list">
              {cartItems.map((item) => (
                <div className="summary-item" key={item.id}>
                  <span>
                    {item.title} × {item.quantity}
                  </span>
                  <span>
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="summary-total">
            <strong>Total:</strong>
            <strong>₹{totalPrice.toLocaleString("en-IN")}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}