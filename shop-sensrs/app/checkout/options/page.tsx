"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthUser = {
  userId: string;
  email: string;
  role: string;
} | null;

export default function CheckoutOptionsPage() {
  const router = useRouter();
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
          router.push("/auth/login");
          return;
        }

        setUser(data.user);
        setAuthorized(true);
      } catch (error) {
        console.error("CHECKOUT OPTIONS AUTH ERROR:", error);
        router.push("/auth/login");
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

  return (
    <section className="checkout-options-page">
      <div className="checkout-options-header">
        <h1>Choose Checkout Option</h1>
        {user && <p>Logged in as {user.email}</p>}
      </div>

      <div className="checkout-options-grid">
        <Link href="/checkout/buy-now" className="checkout-option-card">
          <h2>Buy Now</h2>
          <p>
            Place your order by filling in delivery details and confirming your
            purchase.
          </p>
          <span>Continue to Buy Now</span>
        </Link>

        <Link
          href="/checkout/book-appointment"
          className="checkout-option-card"
        >
          <h2>Book an Appointment</h2>
          <p>
            Schedule a meeting slot with date and time selection for product
            discussion or support.
          </p>
          <span>Continue to Appointment</span>
        </Link>
      </div>
    </section>
  );
}