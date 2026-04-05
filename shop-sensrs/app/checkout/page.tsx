"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

type AuthUser = {
  userId: string;
  email: string;
  role: string;
} | null;

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems } = useCart();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<AuthUser>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });
        const data = await res.json();

        if (!data.success || !data.user) {
          router.push("/auth/login?redirect=/checkout");
          return;
        }

        setUser(data.user);
        setAuthorized(true);
      } catch (error) {
        console.error("AUTH CHECK ERROR:", error);
        router.push("/auth/login?redirect=/checkout");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return <p className="empty-admin-records">Checking authentication...</p>;
  }

  if (!authorized) {
    return null;
  }

  const total = cartItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  return (
    <section className="checkout-page">
      <div className="checkout-page-header">
        <h1>Checkout</h1>
        {user && <p>Logged in as {user.email}</p>}
      </div>

      {cartItems.length === 0 ? (
        <p className="empty-admin-records">Your cart is empty.</p>
      ) : (
        <>
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

          <h2>Total: ₹{total.toLocaleString("en-IN")}</h2>

          <button
            type="button"
            className="primary-btn"
            onClick={() => router.push("/checkout/options")}
          >
            Proceed
          </button>
        </>
      )}
    </section>
  );
}