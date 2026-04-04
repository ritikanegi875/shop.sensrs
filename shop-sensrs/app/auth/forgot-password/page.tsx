"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || "Please check your email.");
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Forgot Password</h1>
        <p>Enter your email address to receive a password reset link.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>

        <p className="auth-switch">
          Back to <Link href="/auth/login">Login</Link>
        </p>
      </div>
    </section>
  );
}