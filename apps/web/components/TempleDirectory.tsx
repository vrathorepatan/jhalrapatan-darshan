"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

interface Temple {
  slug: string;
  name_hi: string;
  name_en: string;
  deity_hi: string | null;
  deity_en: string | null;
  type: string;
  description_hi: string;
  description_en: string;
  timings_hi: string;
  coordinates: { lat: number; lng: number };
  distance_from_main_km: number;
  google_maps_url: string;
  photo?: string | null;
  verify?: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  all: { label: "सभी स्थल (All)", icon: "🏛️" },
  vaishnav: { label: "वैष्णव", icon: "🛕" },
  shaiv: { label: "शैव / सूर्य", icon: "🔱" },
  jain: { label: "जैन", icon: "🕉️" },
  ghat: { label: "पवित्र घाट", icon: "🌊" },
};

export default function TempleDirectory({ temples }: { temples: Temple[] }) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [activePin, setActivePin] = useState<Temple | null>(temples[0] || null);

  const filteredTemples = useMemo(() => {
    return temples.filter((t) => {
      const matchesType =
        selectedType === "all" ||
        t.type === selectedType ||
        (selectedType === "shaiv" && (t.type === "shaiv" || t.type === "shaiv_or_other"));

      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        t.name_hi.toLowerCase().includes(q) ||
        t.name_en.toLowerCase().includes(q) ||
        (t.deity_hi ? t.deity_hi.toLowerCase().includes(q) : false) ||
        t.description_hi.toLowerCase().includes(q);

      return matchesType && matchesSearch;
    });
  }, [temples, search, selectedType]);

  return (
    <div>
      {/* Search and Filters Bar */}
      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          background: "var(--color-bg-card)",
          borderColor: "var(--color-bg-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          {/* Search Input */}
          <div style={{ flex: "1 1 280px", position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.6,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="मंदिर, देवता या नाम खोजें..."
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.5rem",
                background: "var(--color-bg-primary)",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-primary)",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#aaa",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setViewMode("grid")}
              className={`chip`}
              style={{
                cursor: "pointer",
                padding: "0.5rem 1rem",
                background: viewMode === "grid" ? "var(--color-saffron)" : "var(--color-bg-subtle)",
                color: viewMode === "grid" ? "#FFFFFF" : "var(--color-text-primary)",
                border: viewMode === "grid" ? "1.5px solid var(--color-saffron)" : "1px solid var(--color-bg-border)",
                fontWeight: viewMode === "grid" ? 700 : 500,
              }}
            >
              📋 सूची दृश्य
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`chip`}
              style={{
                cursor: "pointer",
                padding: "0.5rem 1rem",
                background: viewMode === "map" ? "var(--color-saffron)" : "var(--color-bg-subtle)",
                color: viewMode === "map" ? "#FFFFFF" : "var(--color-text-primary)",
                border: viewMode === "map" ? "1.5px solid var(--color-saffron)" : "1px solid var(--color-bg-border)",
                fontWeight: viewMode === "map" ? 700 : 500,
              }}
            >
              🗺️ नक्शा देखें
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            scrollbarWidth: "none",
            paddingBottom: "0.25rem",
          }}
        >
          {Object.entries(TYPE_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`chip`}
              style={{
                cursor: "pointer",
                background: selectedType === key ? "var(--color-saffron)" : "var(--color-bg-subtle)",
                color: selectedType === key ? "#FFFFFF" : "var(--color-text-primary)",
                border: selectedType === key ? "1.5px solid var(--color-saffron)" : "1px solid var(--color-bg-border)",
                fontWeight: selectedType === key ? 700 : 500,
                whiteSpace: "nowrap",
                fontSize: "0.85rem",
                padding: "0.35rem 0.85rem",
              }}
            >
              <span>{config.icon}</span> {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested One-Day Route Card */}
      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)",
          border: "1.5px solid #FDE68A",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.8rem" }}>🚩</span>
          <div>
            <h3 style={{ fontSize: "1.1rem", color: "var(--color-heading)", fontWeight: 700, marginBottom: "0.3rem" }}>
              एक दिवसीय झालरापाटन दर्शन यात्रा (Suggested Temple Trail)
            </h3>
            <p className="text-secondary" style={{ fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "0.5rem" }}>
              <b>क्रम:</b> द्वारकाधीश मंदिर (प्रस्थान) → सूर्य मंदिर (300 मी.) → शांतिनाथ जैन मंदिर (600 मी.) → शीतलेश्वर महादेव (800 मी.) → चंद्रभागा घाट पर संध्या आरती (1.2 किमी)।
            </p>
            <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
              🚶 संपूर्ण यात्रा लगभग 2.5 किमी पैदल अथवा ई-रिक्शा द्वारा 3-4 घंटे में सुगमता से संपन्न की जा सकती है।
            </div>
          </div>
        </div>
      </div>

      {/* Map View */}
      {viewMode === "map" && (
        <div className="card" style={{ marginBottom: "2rem", padding: "1rem" }}>
          <h3 style={{ fontSize: "1.15rem", marginBottom: "0.75rem", color: "var(--color-heading)", fontWeight: 700 }}>
            झालरापाटन तीर्थ मानचित्र (Interactive Map)
          </h3>
          <p className="text-secondary" style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>
            मंदिर के पिन पर क्लिक करें अथवा नीचे सूची में से चुनें:
          </p>

          <div
            style={{
              position: "relative",
              height: "360px",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              border: "1.5px solid var(--color-border)",
              marginBottom: "1rem",
            }}
          >
            {/* OpenStreetMap iframe centered around Jhalrapatan */}
            <iframe
              title="Jhalrapatan Temple Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=76.1400%2C24.5450%2C76.1680%2C24.5620&layer=mapnik&marker=${
                activePin?.coordinates.lat || 24.5544
              }%2C${activePin?.coordinates.lng || 76.1555}`}
              style={{ border: 0 }}
            />
          </div>

          {/* Active Pin Card */}
          {activePin && (
            <div
              style={{
                background: "var(--color-bg-subtle)",
                border: "1.5px solid #FED7AA",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <h4 style={{ fontSize: "1.1rem", color: "var(--color-heading)", fontWeight: 700, margin: 0 }}>
                  {activePin.name_hi}
                </h4>
                <p className="text-secondary" style={{ fontSize: "0.85rem", margin: "0.25rem 0" }}>
                  देवता: {activePin.deity_hi} | मुख्य मंदिर से दूरी: {activePin.distance_from_main_km} किमी
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>
                  {activePin.timings_hi}
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link
                  href={`/temples/${activePin.slug}`}
                  className="btn-secondary"
                  style={{ fontSize: "0.85rem", padding: "0.45rem 0.9rem" }}
                >
                  विस्तार देखें
                </Link>
                <a
                  href={activePin.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ fontSize: "0.85rem", padding: "0.45rem 0.9rem" }}
                >
                  मार्ग (Directions) ↗
                </a>
              </div>
            </div>
          )}

          {/* Temple marker selector pills */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
            {temples.map((t) => (
              <button
                key={t.slug}
                onClick={() => setActivePin(t)}
                className="chip"
                style={{
                  cursor: "pointer",
                  background: activePin?.slug === t.slug ? "var(--color-saffron)" : "var(--color-bg-subtle)",
                  color: activePin?.slug === t.slug ? "#FFFFFF" : "var(--color-text-primary)",
                  border: activePin?.slug === t.slug ? "1.5px solid var(--color-saffron)" : "1px solid var(--color-border)",
                  fontWeight: activePin?.slug === t.slug ? 700 : 500,
                  fontSize: "0.8rem",
                }}
              >
                📍 {t.name_hi}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: "1.25rem",
              marginBottom: "2rem",
            }}
          >
            {filteredTemples.map((temple) => (
              <Link
                key={temple.slug}
                href={`/temples/${temple.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="card card-hover"
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: 0,
                    overflow: "hidden",
                  }}
                >
                  {/* Temple Card Header / Banner */}
                  <div
                    style={{
                      height: "120px",
                      background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderBottom: "1px solid var(--color-border)",
                      position: "relative",
                    }}
                  >
                    <span style={{ fontSize: "2.8rem" }}>
                      {temple.type === "vaishnav"
                        ? "🛕"
                        : temple.type === "shaiv" || temple.type === "shaiv_or_other"
                        ? "🔱"
                        : temple.type === "jain"
                        ? "🕉️"
                        : temple.type === "ghat"
                        ? "🌊"
                        : "🏛️"}
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        top: "0.6rem",
                        right: "0.6rem",
                        background: "#FFFFFF",
                        border: "1px solid #FED7AA",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: "var(--color-saffron)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      }}
                    >
                      {temple.distance_from_main_km === 0
                        ? "मुख्य मंदिर"
                        : `${temple.distance_from_main_km} किमी`}
                    </span>
                  </div>

                  {/* Temple Body */}
                  <div style={{ padding: "1.1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ marginBottom: "0.4rem" }}>
                      <h3
                        style={{
                          fontSize: "1.1rem",
                          marginBottom: "0.2rem",
                          color: "var(--color-heading)",
                          fontWeight: 700,
                        }}
                      >
                        {temple.name_hi}
                      </h3>
                      <div className="text-secondary" style={{ fontSize: "0.78rem" }}>
                        {temple.name_en}
                      </div>
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "var(--color-saffron)", fontWeight: 600, marginBottom: "0.5rem" }}>
                      देवता: {temple.deity_hi}
                    </div>

                    <p
                      className="text-secondary"
                      style={{
                        fontSize: "0.82rem",
                        lineHeight: 1.55,
                        flex: 1,
                        marginBottom: "0.75rem",
                      }}
                    >
                      {temple.description_hi.length > 100
                        ? `${temple.description_hi.slice(0, 100)}...`
                        : temple.description_hi}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid #F3E8D8",
                        paddingTop: "0.7rem",
                        fontSize: "0.75rem",
                      }}
                    >
                      <span className="text-muted">{temple.timings_hi.slice(0, 24)}...</span>
                      <span style={{ color: "var(--color-saffron)", fontWeight: 700 }}>
                        विवरण पढ़ें →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredTemples.length === 0 && (
            <div className="card text-center" style={{ padding: "3rem 1rem" }}>
              <span style={{ fontSize: "2.5rem" }}>🔍</span>
              <h3 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>कोई मंदिर नहीं मिला</h3>
              <p className="text-secondary" style={{ fontSize: "0.85rem" }}>
                आपके खोज शब्द &quot;{search}&quot; से मेल खाता कोई तीर्थ स्थल नहीं मिला।
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
