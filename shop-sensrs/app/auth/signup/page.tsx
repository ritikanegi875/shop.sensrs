"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ShoppingBag, Tag, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "sans-serif" }}>
      
      {/* LEFT SIDEBAR HERO FEATURE BLOCK PANEL */}
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
        {/* Decorative Topographic Map Styling Vector Grid lines */}
        <div style={{ opacity: 0.12, position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden" }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100,100 C100,300 300,50 600,200 S800,600 1000,400" fill="none" stroke="#ffffff" strokeWidth="2"/>
            <path d="M-100,200 C150,400 250,150 550,300 S750,700 1050,500" fill="none" stroke="#ffffff" strokeWidth="1.5"/>
            <path d="M-100,300 C200,500 200,250 500,400 S700,800 1100,600" fill="none" stroke="#ffffff" strokeWidth="1"/>
          </svg>
        </div>

        <div style={{ position: "relative", zIndex: 1, marginTop: "15%" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
            <UserPlus size={22} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "16px", letterSpacing: "-0.5px", color: "#ffffff" }}>Join Shop.SEnSRS</h2>
          <p style={{ fontSize: "16px", color: "#c5d6bc", lineHeight: "1.6", maxWidth: "320px" }}>
            Create an account to enjoy exclusive features and offers.
          </p>
        </div>

        {/* FEATURE HIGHLIGHT VALUE CARDS LIST */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "28px", marginBottom: "10%" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
              <ShoppingBag size={16} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "15px", color: "#ffffff" }}>Personalized Shopping</div>
              <div style={{ fontSize: "13px", color: "#c5d6bc", marginTop: "3px", lineHeight: "1.4" }}>Get product recommendations tailored for you.</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
              <Tag size={16} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "15px", color: "#ffffff" }}>Exclusive Deals</div>
              <div style={{ fontSize: "13px", color: "#c5d6bc", marginTop: "3px", lineHeight: "1.4" }}>Access special discounts and member offers.</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
              <ShieldCheck size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "15px", color: "#ffffff" }}>Secure & Reliable</div>
              <div style={{ fontSize: "13px", color: "#c5d6bc", marginTop: "3px", lineHeight: "1.4" }}>Your data is safe with us.</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT WORKSPACE REGISTRATION INPUT CONTAINER */}
      <div style={{ flex: "1 1 60%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" }}>Create Account</h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 32px 0" }}>Sign up to continue shopping with Shop.SEnSRS.</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                style={{ width: "100%", padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#f8fafc", fontSize: "14px", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
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
                  placeholder="Create a password"
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

            {message && (
              <p style={{ fontSize: "13px", fontWeight: "500", color: message.includes("successfully") ? "#16a34a" : "#ef4444", margin: "4px 0 0 0" }}>
                {message}
              </p>
            )}

            {/* UPDATED TO GREEN SIGN UP SUBMIT BUTTON */}
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: "100%", backgroundColor: "#14321a", color: "#ffffff", padding: "14px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", marginTop: "12px", transition: "background 0.2s" }}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b", marginTop: "24px", marginBottom: "32px" }}>
            Already have an account? <Link href="/auth/login" style={{ color: "#16a34a", textDecoration: "none", fontWeight: "600" }}>Login</Link>
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", color: "#94a3b8", textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
            <span style={{ color: "#16a34a" }}>✔</span> Your information is safe with us. We never share your data.
          </div>

        </div>
      </div>

    </div>
  );
}