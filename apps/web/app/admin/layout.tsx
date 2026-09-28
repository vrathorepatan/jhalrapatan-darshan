import Link from "next/link";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }}>
      {/* Admin Header */}
      <nav
        style={{
          background: "var(--color-bg-card)",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "0.85rem",
            paddingBottom: "0.85rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link
              href="/admin"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>🚩</span>
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.1rem",
                    color: "var(--color-gold-light)",
                    fontWeight: 700,
                  }}
                >
                  प्रबंधन कक्ष
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.65rem",
                    color: "var(--color-text-secondary)",
                    letterSpacing: "0.05em",
                  }}
                >
                  Jhalrapatan Darshan Admin
                </span>
              </div>
            </Link>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Link
              href="/"
              target="_blank"
              style={{
                fontSize: "0.8rem",
                color: "var(--color-gold-light)",
                textDecoration: "none",
                padding: "0.35rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(201,168,76,0.3)",
              }}
            >
              वेबसाइट देखें ↗
            </Link>
          </div>
        </div>

        {/* Admin Subnav */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(10,11,30,0.6)",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              gap: "0.5rem",
              paddingTop: "0.4rem",
              paddingBottom: "0.4rem",
            }}
          >
            <Link
              href="/admin"
              className="chip"
              style={{ fontSize: "0.8rem", textDecoration: "none" }}
            >
              📊 डैशबोर्ड
            </Link>
            <Link
              href="/admin/schedule"
              className="chip"
              style={{ fontSize: "0.8rem", textDecoration: "none" }}
            >
              ⏱️ दर्शन समय
            </Link>
            <Link
              href="/admin/overrides"
              className="chip"
              style={{ fontSize: "0.8rem", textDecoration: "none" }}
            >
              🔄 विशेष फेरबदल
            </Link>
            <Link
              href="/admin/closures"
              className="chip"
              style={{ fontSize: "0.8rem", textDecoration: "none" }}
            >
              🚫 पट बंदी
            </Link>
            <Link
              href="/admin/announcements"
              className="chip"
              style={{ fontSize: "0.8rem", textDecoration: "none" }}
            >
              📢 सूचना पट्टी
            </Link>
            <Link
              href="/admin/audit-log"
              className="chip"
              style={{ fontSize: "0.8rem", textDecoration: "none" }}
            >
              📜 ऑडिट लॉग
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Admin Content */}
      <main className="container" style={{ paddingTop: "1.5rem", paddingBottom: "4rem" }}>
        {children}
      </main>
    </div>
  );
}
