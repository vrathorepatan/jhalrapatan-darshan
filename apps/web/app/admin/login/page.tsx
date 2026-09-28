"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push("/admin");
      } else {
        setError(data.error || "पासवर्ड अमान्य है।");
      }
    } catch {
      setError("नेटवर्क संपर्क में त्रुटि। पुनः प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2rem",
          background: "var(--color-bg-card)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          border: "1px solid rgba(201,168,76,0.25)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{ fontSize: "2.5rem" }}>🛕</span>
          <h1
            style={{
              fontSize: "1.4rem",
              marginTop: "0.5rem",
              marginBottom: "0.25rem",
              color: "var(--color-gold-light)",
            }}
          >
            प्रबंधन कक्ष प्रवेश
          </h1>
          <p className="text-secondary" style={{ fontSize: "0.85rem" }}>
            श्री द्वारकाधीश मंदिर, झालरापाटन
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(229,57,53,0.15)",
              border: "1px solid #E53935",
              color: "#FF8A80",
              padding: "0.6rem 0.8rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                marginBottom: "0.4rem",
              }}
            >
              प्रबंधन पासवर्ड (Admin Password)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="पासवर्ड दर्ज करें..."
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text-primary)",
                fontSize: "1rem",
                outline: "none",
              }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.3rem", display: "block" }}>
              डिफ़ॉल्ट परीक्षण पासवर्ड: <code>Dwarkadhish@123</code>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {loading ? "सत्यापित किया जा रहा है..." : "लॉगिन करें (Enter)"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link
            href="/"
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              textDecoration: "none",
            }}
          >
            ← मुख्य वेबसाइट पर वापस जाएं
          </Link>
        </div>
      </div>
    </div>
  );
}
