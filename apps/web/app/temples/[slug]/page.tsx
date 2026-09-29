import type { Metadata } from "next";
import { notFound } from "next/navigation";
import templesData from "../../../../../data/temples.json";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return templesData.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const temple = templesData.find((t) => t.slug === slug);
  if (!temple) return {};
  return {
    title: `${temple.name_hi} – झालरापाटन दर्शन`,
    description: temple.description_hi,
  };
}

export default async function TempleDetailPage({ params }: Props) {
  const { slug } = await params;
  const temple = templesData.find((t) => t.slug === slug);
  if (!temple) notFound();

  return (
    <div className="container" style={{ paddingTop: "1.5rem" }}>
      {/* Back link */}
      <a
        href="/temples"
        className="text-muted"
        style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.3rem", marginBottom: "1rem" }}
      >
        ← सभी मंदिर
      </a>

      {/* Hero image */}
      <div
        style={{
          width: "100%",
          height: "240px",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          marginBottom: "1.25rem",
          background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)",
          border: "1.5px solid #FDE68A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <span style={{ fontSize: "4rem" }}>
          {temple.type === "vaishnav" ? "🛕" :
           temple.type === "shaiv" || temple.type === "shaiv_or_other" ? "🔱" :
           temple.type === "jain" ? "🕉️" :
           temple.type === "ghat" ? "🌊" : "🏛️"}
        </span>
        {temple.photo_verify && (
          <span className="chip chip-verify">फोटो शीघ्र उपलब्ध होगा</span>
        )}
      </div>

      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>{temple.name_hi}</h1>
        <p className="text-secondary" style={{ fontSize: "0.875rem" }}>
          {temple.name_en}
        </p>
        {temple.deity_hi && (
          <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
            🙏 देवता: <span style={{ color: "var(--color-heading)", fontWeight: 700 }}>{temple.deity_hi}</span>
          </p>
        )}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          {temple.verify && <span className="chip chip-verify">⚠️ verify</span>}
          {temple.distance_from_main_km > 0 && (
            <span className="chip">📍 {temple.distance_from_main_km} किमी मुख्य मंदिर से</span>
          )}
        </div>
      </header>

      {/* Description */}
      <section style={{ marginBottom: "1.25rem" }}>
        <div className="card">
          <p className="text-secondary" style={{ lineHeight: 1.8 }}>
            {temple.description_hi}
          </p>
        </div>
      </section>

      {/* History */}
      <section style={{ marginBottom: "1.25rem" }}>
        <div className="section-title">
          <h2 style={{ fontSize: "1.05rem" }}>इतिहास</h2>
        </div>
        <div className="card">
          <p className="text-secondary" style={{ lineHeight: 1.8 }}>
            {temple.history_hi}
          </p>
          {temple.history_verify && (
            <span className="chip chip-verify" style={{ marginTop: "0.75rem" }}>
              ⚠️ समिति से पुष्टि अपेक्षित
            </span>
          )}
        </div>
      </section>

      {/* Timings */}
      <section style={{ marginBottom: "1.25rem" }}>
        <div className="section-title">
          <h2 style={{ fontSize: "1.05rem" }}>दर्शन समय</h2>
        </div>
        <div className="card">
          <p className="text-secondary">{temple.timings_hi}</p>
          {temple.timings_verify && (
            <span className="chip chip-verify" style={{ marginTop: "0.5rem" }}>verify</span>
          )}
        </div>
      </section>

      {/* Map & Directions */}
      <section style={{ marginBottom: "2rem" }}>
        <div className="section-title">
          <h2 style={{ fontSize: "1.05rem" }}>मानचित्र</h2>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div
            style={{
              height: "180px",
              background: "var(--color-bg-elevated)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontSize: "2rem" }}>🗺️</span>
            <p className="text-muted" style={{ fontSize: "0.78rem" }}>
              {temple.coordinates.verify ? "अनुमानित स्थान" : "मानचित्र"}
            </p>
          </div>
          <a
            href={temple.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ textAlign: "center", justifyContent: "center" }}
          >
            📍 Google Maps पर खोलें
          </a>
        </div>
      </section>
    </div>
  );
}
