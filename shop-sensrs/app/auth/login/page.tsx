"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Login failed");
        setLoading(false);
        return;
      }

      setMessage("Login successful. Redirecting...");

      setTimeout(() => {
        if (data.user?.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }, 300);
    } catch (error) {
      console.error("LOGIN PAGE ERROR:", error);
      setMessage("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>
        <p>Access your account to continue.</p>

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

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don’t have an account? <Link href="/auth/signup">Sign Up</Link>
        </p>

        <p className="auth-switch">
          <Link href="/auth/forgot-password">Forgot Password?</Link>
        </p>
      </div>
    </section>
  );
}