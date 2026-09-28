"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface LiveStatus {
  isLive: boolean;
  currentAarti: { id?: string; name_hi: string; name_en: string; endsAt?: string } | null;
  nextAarti: { id?: string; name_hi: string; name_en: string; startsAt?: string } | null;
  streamHealthy: boolean;
  heartbeat?: {
    bitrate: number;
    uptime: number;
    lastSeen: string | null;
  };
  closureMessage: string | null;
}

export default function AdminDashboardPage() {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/live-status", { cache: "no-store" });
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to load status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleGoLive = async () => {
    if (!confirm("क्या आप अभी सीधा प्रसारण (Live Darshan) शुरू करना चाहते हैं?")) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/stream/go-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotName: "विशेष दर्शन (प्रबंधन द्वारा)" }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ लाइव प्रसारण शुरू कर दिया गया है।");
        fetchStatus();
      } else {
        setMessage("❌ त्रुटि: " + (data.error || "कार्रवाई विफल"));
      }
    } catch {
      setMessage("❌ नेटवर्क त्रुटि");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndLive = async () => {
    if (!confirm("क्या आप सीधा प्रसारण (Live Darshan) अभी समाप्त करना चाहते हैं?")) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/stream/end-live", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMessage("🛑 लाइव प्रसारण समाप्त कर दिया गया है।");
        fetchStatus();
      } else {
        setMessage("❌ त्रुटि: " + (data.error || "कार्रवाई विफल"));
      }
    } catch {
      setMessage("❌ नेटवर्क त्रुटि");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            मंदिर नियंत्रण कक्ष (Dashboard)
          </h1>
          <p className="text-secondary" style={{ fontSize: "0.85rem" }}>
            श्री द्वारकाधीश मंदिर, झालरापाटन – सीधा प्रसारण व समय प्रबंधन
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={fetchStatus}
            className="btn btn-secondary"
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
          >
            🔄 रीफ़्रेश
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem", color: "#FF7B7B" }}
          >
            लॉगआउट
          </button>
        </div>
      </div>

      {message && (
        <div
          className="card"
          style={{
            marginBottom: "1.5rem",
            background: message.startsWith("✅") ? "rgba(46,125,50,0.2)" : "rgba(198,40,40,0.2)",
            borderColor: message.startsWith("✅") ? "#81C784" : "#E57373",
            padding: "0.75rem 1rem",
          }}
        >
          {message}
        </div>
      )}

      {/* Primary Action Card: Live Controls */}
      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          border: status?.isLive ? "1px solid #FF4444" : "1px solid var(--color-border)",
          background: status?.isLive
            ? "linear-gradient(135deg, rgba(255,68,68,0.1), rgba(14,16,48,0.8))"
            : "var(--color-bg-card)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: status?.isLive ? "#FF4444" : "#888899",
                  boxShadow: status?.isLive ? "0 0 10px #FF4444" : "none",
                }}
              />
              <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                {status?.isLive ? "वर्तमान में लाइव प्रसारण जारी है" : "वर्तमान में पट बंद हैं (ऑफ़लाइन)"}
              </h2>
            </div>
            <p className="text-secondary" style={{ fontSize: "0.85rem", margin: 0 }}>
              {status?.isLive
                ? `आरती: ${status.currentAarti?.name_hi || "विशेष दर्शन"}`
                : `अगला दर्शन: ${status?.nextAarti?.name_hi || "निर्धारित नहीं"}`}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            {!status?.isLive ? (
              <button
                onClick={handleGoLive}
                disabled={actionLoading}
                className="btn btn-primary"
                style={{
                  background: "linear-gradient(135deg, #E8702A, #FF4444)",
                  padding: "0.6rem 1.4rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                }}
              >
                🔴 अभी लाइव करो (Go Live Now)
              </button>
            ) : (
              <button
                onClick={handleEndLive}
                disabled={actionLoading}
                className="btn btn-primary"
                style={{
                  background: "linear-gradient(135deg, #C62828, #8E0000)",
                  padding: "0.6rem 1.4rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                }}
              >
                ⏹️ लाइव बंद करो (End Live)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stream Hardware Health & Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div className="card">
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
            कैमरा व इनजेस्ट स्थिति
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>
              {status?.streamHealthy ? "🟢" : "🔴"}
            </span>
            <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>
              {status?.streamHealthy ? "कनेक्टेड (Online)" : "डिस्कनेक्टेड (Offline)"}
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
            {status?.heartbeat?.lastSeen
              ? `अंतिम सिग्नल: ${new Date(status.heartbeat.lastSeen).toLocaleTimeString("hi-IN")}`
              : "कोई सिग्नल प्राप्त नहीं"}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
            स्ट्रीम बिटरेट (Bitrate)
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-gold-light)" }}>
            {status?.heartbeat?.bitrate ? `${status.heartbeat.bitrate} kbps` : "0 kbps"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            अनुशंसित: 2500 - 3000 kbps (720p/1080p)
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
            सिस्टम अपटाइम
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>
            {status?.heartbeat?.uptime
              ? `${Math.floor(status.heartbeat.uptime / 3600)}h ${Math.floor((status.heartbeat.uptime % 3600) / 60)}m`
              : "0h"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            मंदिर मिनी पीसी / सिस्टमडी सेवा
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>प्रबंधन विकल्प (Management)</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        <Link href="/admin/schedule" style={{ textDecoration: "none" }}>
          <div className="card card-hover" style={{ height: "100%" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>⏱️</div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>दैनिक आरती समय (Schedule)</h3>
            <p className="text-secondary" style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
              ग्रीष्मकालीन और शीतकालीन 6 आरतियों के नियमित समय बदलें या चालू/बंद करें।
            </p>
          </div>
        </Link>

        <Link href="/admin/overrides" style={{ textDecoration: "none" }}>
          <div className="card card-hover" style={{ height: "100%" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>🔄</div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>तिथि अनुसार विशेष फेरबदल (Overrides)</h3>
            <p className="text-secondary" style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
              त्योहार या विशेष अवसर पर किसी एक दिन आरती का समय बदलें अथवा अतिरिक्त आरती जोड़ें।
            </p>
          </div>
        </Link>

        <Link href="/admin/closures" style={{ textDecoration: "none" }}>
          <div className="card card-hover" style={{ height: "100%" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>🚫</div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>पट बंदी घोषणा (Closures)</h3>
            <p className="text-secondary" style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
              ग्रहण, विशेष सेवा या मरम्मत के समय दर्शन बंद की तारीख़ व कारण दर्ज करें।
            </p>
          </div>
        </Link>

        <Link href="/admin/announcements" style={{ textDecoration: "none" }}>
          <div className="card card-hover" style={{ height: "100%" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>📢</div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>सूचना पट्टी (Announcements)</h3>
            <p className="text-secondary" style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
              भक्तों के लिए मुख्य पृष्ठ पर पीले रंग की विशेष सूचना पट्टी (Announcement Banner) लगाएं।
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
