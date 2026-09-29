import type { Metadata } from "next";
import scheduleData from "../../../../data/schedule.json";

export const metadata: Metadata = {
  title: "दर्शन समय – श्री द्वारकाधीश मंदिर",
  description:
    "श्री द्वारकाधीश मंदिर, झालरापाटन का दर्शन समय – मंगला, श्रृंगार, राजभोग, उत्थापन, सन्ध्या और शयन आरती का ग्रीष्म और शीतकालीन कार्यक्रम।",
};

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period =
    h < 12 ? "प्रातः" : h < 18 ? "दोपहर" : h < 21 ? "सायं" : "रात्रि";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function TimingsPage() {
  return (
    <div className="container" style={{ paddingTop: "1.5rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>दर्शन समय</h1>
        <p className="text-secondary" style={{ fontSize: "0.875rem" }}>
          श्री द्वारकाधीश मंदिर, झालरापाटन
        </p>
      </header>

      <div
        style={{
          background: "#FFF7ED",
          border: "1.5px solid #FED7AA",
          borderRadius: "var(--radius-md)",
          padding: "0.75rem 1rem",
          marginBottom: "1.5rem",
          fontSize: "0.88rem",
          color: "var(--color-heading)",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          fontWeight: 500,
        }}
        role="alert"
      >
        <span style={{ fontSize: "1.1rem" }}>⚠️</span>
        <span>
          नीचे दिए समय अनुमानित हैं। कृपया मंदिर समिति से पुष्टि करें।
        </span>
      </div>

      {scheduleData.seasons.map((season) => (
        <section
          key={season.season}
          aria-labelledby={`${season.season}-heading`}
          style={{ marginBottom: "2rem" }}
        >
          <div className="section-title">
            <h2 id={`${season.season}-heading`} style={{ fontSize: "1.15rem" }}>
              {season.label_hi}
            </h2>
          </div>
          <p className="text-muted" style={{ fontSize: "0.8rem", marginBottom: "1rem" }}>
            {season.season === "summer"
              ? "अप्रैल 1 से सितंबर 30 तक"
              : "अक्टूबर 1 से मार्च 31 तक"}
            {season.verify && (
              <span className="chip chip-verify" style={{ marginLeft: "0.5rem" }}>
                verify
              </span>
            )}
          </p>

          <div className="card">
            {/* Header row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderBottom: "1px solid var(--color-bg-border)",
                marginBottom: "0.5rem",
              }}
            >
              <span className="text-muted" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                आरती
              </span>
              <span className="text-muted" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                प्रारंभ
              </span>
              <span className="text-muted" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                समाप्ति
              </span>
            </div>

            {season.slots.map((slot) => (
              <div
                key={slot.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  alignItems: "center",
                  opacity: slot.enabled ? 1 : 0.4,
                }}
              >
                <span className="aarti-name" style={{ fontSize: "0.95rem" }}>
                  {slot.name_hi}
                </span>
                <span
                  className="aarti-time"
                  style={{ fontSize: "0.9rem", minWidth: "unset" }}
                >
                  {formatTime(slot.start)}
                </span>
                <span
                  className="aarti-time"
                  style={{ fontSize: "0.9rem", minWidth: "unset", color: "var(--color-text-secondary)" }}
                >
                  {formatTime(slot.end)}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}

      <p className="text-muted" style={{ fontSize: "0.75rem", textAlign: "center", marginBottom: "2rem" }}>
        अंतिम अद्यतन: शीघ्र • विशेष दिनों के लिए समिति से संपर्क करें
      </p>
    </div>
  );
}
