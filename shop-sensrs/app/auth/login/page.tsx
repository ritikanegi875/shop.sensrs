"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ShieldCheck, ShoppingCart, Tag, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "sans-serif" }}>
      
      {/* LEFT SIDEBAR PANEL */}
      <div style={{ 
        flex: "1 1 40%", 
        backgroundColor: "#14321a", 
        color: "#ffffff", 
        padding: "48px", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "space-between",
        position: "relative",
        backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05) 0%, transparent 80%)"
      }}>
        {/* Topographic line decoration overlays */}
        <div style={{ opacity: 0.15, position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden" }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100,100 C100,300 300,50 600,200 S800,600 1000,400" fill="none" stroke="#ffffff" strokeWidth="2"/>
            <path d="M-100,200 C150,400 250,150 550,300 S750,700 1050,500" fill="none" stroke="#ffffff" strokeWidth="1.5"/>
            <path d="M-100,300 C200,500 200,250 500,400 S700,800 1100,600" fill="none" stroke="#ffffff" strokeWidth="1"/>
          </svg>
        </div>

        <div style={{ position: "relative", zIndex: 1, marginTop: "15%" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "16px", letterSpacing: "-0.5px", color: "#ffffff" }}>Welcome back!</h2>
          <p style={{ fontSize: "16px", color: "#c5d6bc", lineHeight: "1.6", maxWidth: "340px" }}>
            Login to access your account and explore the best in electronics.
          </p>
        </div>

        {/* FEATURE INFO ITEMS */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "24px", marginBottom: "10%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "15px", color: "#ffffff" }}>Secure</div>
              <div style={{ fontSize: "13px", color: "#c5d6bc", marginTop: "2px" }}>Your data is protected</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingCart size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "15px", color: "#ffffff" }}>Fast Checkout</div>
              <div style={{ fontSize: "13px", color: "#c5d6bc", marginTop: "2px" }}>Save time & shop more</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Tag size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "15px", color: "#ffffff" }}>Exclusive Deals</div>
              <div style={{ fontSize: "13px", color: "#c5d6bc", marginTop: "2px" }}>For our registered users</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT WORKSPACE SHEET */}
      <div style={{ flex: "1 1 60%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" }}>Login</h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 32px 0" }}>Access your account to continue.</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{ width: "100%", padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#f8fafc", fontSize: "14px", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>Password</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: "100%", padding: "12px 44px 12px 16px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#f8fafc", fontSize: "14px", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ACTION FOOTER SPLIT CHECKBOX ROW */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", marginTop: "4px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155", cursor: "pointer", userSelect: "none" }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#14321a", cursor: "pointer" }}
                />
                <span>Remember me</span>
              </label>
              <Link href="/auth/forgot-password" style={{ color: "#16a34a", textDecoration: "none", fontWeight: "500" }}>Forgot Password?</Link>
            </div>

            {message && (
              <p style={{ fontSize: "13px", fontWeight: "500", color: message.includes("successful") ? "#16a34a" : "#ef4444", margin: "4px 0 0 0" }}>
                {message}
              </p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: "100%", backgroundColor: "#14321a", color: "#ffffff", padding: "14px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", marginTop: "8px", transition: "background 0.2s" }}
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b", margin: "24px 0 0 0" }}>
            Don’t have an account? <Link href="/auth/signup" style={{ color: "#16a34a", textDecoration: "none", fontWeight: "600" }}>Sign Up</Link>
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", color: "#94a3b8", marginTop: "40px", textAlign: "center" }}>
            <span style={{ color: "#16a34a" }}>✔</span> Your information is safe with us. We never share your data.
          </div>

        </div>
      </div>

    </div>
  );
}