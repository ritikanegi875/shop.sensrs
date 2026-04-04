"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });
        const data = await res.json();

        if (data.success && data.user) {
          if (data.user.role === "admin") {
            router.replace("/admin");
          } else {
            router.replace("/");
          }
        }
      } catch (error) {
        console.error("AUTH CHECK ERROR:", error);
      }
    }

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      setMessage("Account created successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
    } catch (error) {
      setMessage("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Sign up to continue shopping with Shop.SEnSRS.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link href="/auth/login">Login</Link>
        </p>
      </div>
    </section>
  );
}