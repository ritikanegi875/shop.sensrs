"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "N/A";
  const type = searchParams.get("type") || "";

  const title =
    type === "buy-now" ? "Order Confirmed" : "Appointment Confirmed";

  const message =
    type === "buy-now"
      ? "Your order form has been submitted successfully."
      : "Your appointment request has been submitted successfully.";

  return (
    <section className="checkout-success-page">
      <div className="checkout-success-card">
        <h1>{title}</h1>
        <p>{message}</p>
        <div className="success-code-box">Reference Code: {code}</div>

        <div className="success-actions">
          <Link href="/">
            <button className="primary-btn">Go to Home</button>
          </Link>
          <Link href="/products">
            <button className="secondary-btn">Continue Shopping</button>
          </Link>
        </div>
      </div>
    </section>
  );
}