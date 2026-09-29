import type { Metadata } from "next";
import mandirData from "../../../../data/mandir.json";

export const metadata: Metadata = {
  title: "मंदिर परिचय – श्री द्वारकाधीश मंदिर, झालरापाटन",
  description:
    "श्री द्वारकाधीश मंदिर, झालरापाटन का इतिहास, महत्व, दर्शन नियम, कैसे पहुँचें और संपर्क जानकारी।",
};

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  verify?: boolean;
}

function InfoRow({ icon, label, value, verify }: InfoRowProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        padding: "0.75rem 0",
        borderBottom: "1px solid var(--color-bg-border)",
      }}
    >
      <span style={{ fontSize: "1.2rem", flexShrink: 0, marginTop: "2px" }}>{icon}</span>
      <div>
        <p className="text-muted" style={{ fontSize: "0.73rem", marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
          {verify && <span className="chip chip-verify" style={{ marginLeft: "0.5rem", fontSize: "0.6rem" }}>verify</span>}
        </p>
        <p className="text-secondary" style={{ fontSize: "0.9rem" }}>{value}</p>
      </div>
    </div>
  );
}

export default function MandirPage() {
  const reach = mandirData.how_to_reach;

  return (
    <div className="container" style={{ paddingTop: "1.5rem" }}>
      <header style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>{mandirData.name_hi}</h1>
        <p className="text-secondary" style={{ fontSize: "0.875rem" }}>
          {mandirData.contact.address_hi}
        </p>
      </header>

      {/* Sacred Mandir Idol Photo Hero */}
      <div
        className="card"
        style={{
          padding: "0.85rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)",
          border: "1.5px solid #FDE68A",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/dwarkadhish.jpg"
          alt="श्री द्वारकाधीश जी, झालरापाटन"
          style={{
            width: "110px",
            height: "140px",
            objectFit: "cover",
            objectPosition: "top center",
            borderRadius: "var(--radius-md)",
            border: "2px solid #F59E0B",
            boxShadow: "0 4px 14px rgba(230,81,0,0.2)",
            flexShrink: 0,
            background: "#1C1914",
          }}
        />
        <div>
          <span
            style={{
              background: "#FFFFFF",
              color: "var(--color-saffron)",
              border: "1px solid #FED7AA",
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              display: "inline-block",
              marginBottom: "0.4rem",
            }}
          >
            🛕 प्रमुख विग्रह दर्शन
          </span>
          <h2 style={{ fontSize: "1.2rem", color: "var(--color-heading)", fontWeight: 700, margin: "0 0 0.3rem" }}>
            भगवान श्री द्वारकाधीश जी
          </h2>
          <p className="text-secondary" style={{ fontSize: "0.85rem", lineHeight: 1.5, margin: 0 }}>
            झालरापाटन के अधिष्ठाता देव, चतुर्भुज स्वरूप भगवान श्री द्वारकाधीश जी के दिव्य विग्रह के पावन दर्शन।
          </p>
        </div>
      </div>

      {/* Significance */}
      <section aria-labelledby="significance-heading" style={{ marginBottom: "1.5rem" }}>
        <div className="section-title">
          <h2 id="significance-heading" style={{ fontSize: "1.1rem" }}>
            महत्व
          </h2>
        </div>
        <div className="card">
          <p className="text-secondary" style={{ lineHeight: 1.8 }}>
            {mandirData.significance_hi}
          </p>
          {mandirData.significance_verify && (
            <span className="chip chip-verify" style={{ marginTop: "0.75rem" }}>
              ⚠️ समिति से पुष्टि अपेक्षित
            </span>
          )}
        </div>
      </section>

      {/* History */}
      <section aria-labelledby="history-heading" style={{ marginBottom: "1.5rem" }}>
        <div className="section-title">
          <h2 id="history-heading" style={{ fontSize: "1.1rem" }}>
            इतिहास
          </h2>
        </div>
        <div className="card">
          <p className="text-secondary" style={{ lineHeight: 1.8 }}>
            {mandirData.history_hi}
          </p>
          {mandirData.history_verify && (
            <span className="chip chip-verify" style={{ marginTop: "0.75rem" }}>
              ⚠️ समिति से पुष्टि अपेक्षित
            </span>
          )}
        </div>
      </section>

      {/* Rules */}
      <section aria-labelledby="rules-heading" style={{ marginBottom: "1.5rem" }}>
        <div className="section-title">
          <h2 id="rules-heading" style={{ fontSize: "1.1rem" }}>
            मंदिर नियम
          </h2>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          {[
            { icon: "👗", label: "वस्त्र", value: mandirData.rules.dress_code_hi },
            { icon: "👟", label: "जूते-चप्पल", value: mandirData.rules.footwear_hi },
            { icon: "📱", label: "मोबाइल", value: mandirData.rules.mobile_hi },
            { icon: "📸", label: "फोटोग्राफी", value: mandirData.rules.photography_hi },
          ].map((rule) => (
            <InfoRow key={rule.label} icon={rule.icon} label={rule.label} value={rule.value} verify={mandirData.rules.verify} />
          ))}
        </div>
      </section>

      {/* How to reach */}
      <section aria-labelledby="reach-heading" style={{ marginBottom: "1.5rem" }}>
        <div className="section-title">
          <h2 id="reach-heading" style={{ fontSize: "1.1rem" }}>
            कैसे पहुँचें
          </h2>
        </div>
        <div className="card">
          <InfoRow
            icon="🚂"
            label="निकटतम रेलवे स्टेशन"
            value={`${reach.nearest_railway_station} (लगभग ${reach.railway_distance_km} किमी)`}
            verify={reach.railway_verify}
          />
          <InfoRow
            icon="🚌"
            label="सड़क मार्ग"
            value={reach.by_road_hi}
            verify={reach.by_road_verify}
          />
          <InfoRow
            icon="🏙️"
            label="निकटतम शहर"
            value={`${reach.nearest_city} (लगभग ${reach.distance_from_kota_km} किमी)`}
            verify={reach.distance_verify}
          />

          {/* Map placeholder */}
          <div
            style={{
              marginTop: "1rem",
              height: "200px",
              background: "var(--color-bg-elevated)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "0.5rem",
              border: "1px solid var(--color-bg-border)",
            }}
          >
            <span style={{ fontSize: "2rem" }}>🗺️</span>
            <p className="text-muted" style={{ fontSize: "0.8rem" }}>
              इंटरेक्टिव मानचित्र शीघ्र
            </p>
            <a
              href={`https://maps.google.com/?q=${reach.coordinates.lat},${reach.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
              style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}
            >
              Google Maps पर देखें
            </a>
          </div>
        </div>
      </section>

      {/* Prasad & Seva */}
      <section aria-labelledby="prasad-heading" style={{ marginBottom: "1.5rem" }}>
        <div className="section-title">
          <h2 id="prasad-heading" style={{ fontSize: "1.1rem" }}>
            प्रसाद और सेवा
          </h2>
        </div>
        <div className="card">
          <p className="text-secondary" style={{ lineHeight: 1.8, marginBottom: "0.75rem" }}>
            {mandirData.prasad_hi}
          </p>
          <span className="chip chip-verify">समिति से जानकारी अपेक्षित</span>
          <div className="divider-gold" />
          <p className="text-secondary" style={{ lineHeight: 1.8 }}>
            {mandirData.seva_hi}
          </p>
        </div>
      </section>

      {/* Donation */}
      <section aria-labelledby="donation-heading" style={{ marginBottom: "2rem" }}>
        <div className="section-title">
          <h2 id="donation-heading" style={{ fontSize: "1.1rem" }}>
            दान और संपर्क
          </h2>
        </div>
        <div className="card">
          <p className="text-secondary" style={{ lineHeight: 1.8 }}>
            {mandirData.donation_hi}
          </p>
          <span className="chip chip-verify" style={{ marginTop: "0.5rem" }}>
            संपर्क नंबर शीघ्र
          </span>
        </div>
      </section>
    </div>
  );
}
