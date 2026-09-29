import type { Metadata } from "next";
import festivalsData from "../../../../data/festivals.json";


export const metadata: Metadata = {
  title: "उत्सव कैलेंडर – झालरापाटन दर्शन",
  description:
    "श्री द्वारकाधीश मंदिर, झालरापाटन का उत्सव कैलेंडर – जन्माष्टमी, अन्नकूट, होली, राम नवमी, दीपावली और सभी प्रमुख पर्वों की जानकारी।",
};

const FESTIVAL_ICONS: Record<string, string> = {
  janmashtami:   "🪈",
  annakut:       "🏔️",
  holi_fagotsav: "🎨",
  ram_navami:    "🏹",
  deepawali:     "🪔",
  basant_panchami: "🌻",
  ekadashi:      "🌿",
  purnima:       "🌕",
  sharad_purnima:"🌾",
};

export default function UtsavPage() {
  return (
    <div className="container" style={{ paddingTop: "1.5rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>उत्सव कैलेंडर</h1>
        <p className="text-secondary" style={{ fontSize: "0.875rem" }}>
          प्रमुख पर्व और विशेष दर्शन
        </p>
      </header>

      {/* Tithi calendar placeholder */}
      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          textAlign: "center",
          padding: "2rem 1rem",
          background: "linear-gradient(135deg, #FFF9F0 0%, #FEF3C7 100%)",
          border: "1.5px solid #FDE68A",
        }}
      >
        <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🗓️</p>
        <p className="text-hindi" style={{ color: "var(--color-heading)", fontSize: "1.1rem", fontWeight: 700 }}>
          तिथि कैलेंडर
        </p>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginTop: "0.4rem" }}>
          हिंदू तिथि कैलेंडर शीघ्र उपलब्ध होगा
        </p>
        <span className="chip chip-verify" style={{ marginTop: "0.75rem" }}>
          Milestone 2 में आएगा
        </span>
      </div>

      {/* Festival list */}
      <section aria-labelledby="festivals-heading">
        <div className="section-title">
          <h2 id="festivals-heading" style={{ fontSize: "1.1rem" }}>
            प्रमुख उत्सव
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {festivalsData.map((festival) => (
            <div key={festival.id} className="card">
              <div
                style={{
                  display: "flex",
                  gap: "0.85rem",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "2rem", lineHeight: 1, flexShrink: 0 }}>
                  {FESTIVAL_ICONS[festival.id] ?? "🙏"}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <h3
                      className="text-hindi"
                      style={{ fontSize: "1.1rem", color: "var(--color-heading)", fontWeight: 700, margin: 0 }}
                    >
                      {festival.name_hi}
                    </h3>
                    {festival.verify && (
                      <span className="chip chip-verify">verify</span>
                    )}
                  </div>
                  <p className="text-muted" style={{ fontSize: "0.78rem", marginBottom: "0.5rem" }}>
                    {festival.tithi}
                  </p>
                  <p className="text-secondary" style={{ fontSize: "0.875rem" }}>
                    {festival.description_hi}
                  </p>
                  {festival.mandir_programme_hi && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        background: "var(--color-bg-subtle)",
                        borderLeft: "3px solid var(--color-saffron)",
                        borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                        fontSize: "0.85rem",
                        color: "var(--color-heading)",
                        fontWeight: 500,
                      }}
                    >
                      {festival.mandir_programme_hi}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p
        className="text-muted"
        style={{ fontSize: "0.75rem", textAlign: "center", margin: "1.5rem 0" }}
      >
        * सभी कार्यक्रम मंदिर समिति की पुष्टि के अधीन हैं
      </p>
    </div>
  );
}
