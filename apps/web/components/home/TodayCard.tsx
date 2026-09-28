import scheduleData from "../../../../data/schedule.json";
import festivalsData from "../../../../data/festivals.json";

function getISTDate(): Date {
  // Get current date/time in IST (Asia/Kolkata = UTC+5:30)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + istOffset - now.getTimezoneOffset() * 60_000);
}

function formatTime(hhmm: string, lang: "hi" | "en" = "hi"): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? (lang === "hi" ? "प्रातः" : "AM") : h < 18 ? (lang === "hi" ? "दोपहर" : "PM") : h < 21 ? (lang === "hi" ? "सायं" : "PM") : (lang === "hi" ? "रात्रि" : "PM");
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function getCurrentSeason(date: Date) {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const md = month * 100 + day;
  // Summer: Apr 1 (401) – Sep 30 (930)
  if (md >= 401 && md <= 930) {
    return scheduleData.seasons.find((s) => s.season === "summer");
  }
  return scheduleData.seasons.find((s) => s.season === "winter");
}

const WEEKDAYS_HI = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
const MONTHS_HI = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];

export function TodayCard() {
  const istDate = getISTDate();
  const weekday = WEEKDAYS_HI[istDate.getUTCDay()];
  const day = istDate.getUTCDate();
  const month = MONTHS_HI[istDate.getUTCMonth()];
  const year = istDate.getUTCFullYear();

  const season = getCurrentSeason(istDate);
  const slots = season?.slots.filter((s) => s.enabled) ?? [];

  return (
    <section aria-labelledby="today-heading" style={{ marginBottom: "1.5rem" }}>
      <div className="section-title">
        <h2 id="today-heading" style={{ fontSize: "1.1rem" }}>
          आज का दर्शन
        </h2>
      </div>

      <div className="card">
        {/* Date */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1rem",
          }}
        >
          <div>
            <p className="text-hindi" style={{ fontSize: "1.1rem", color: "#F5D87E" }}>
              {weekday}, {day} {month} {year}
            </p>
            <p className="text-muted" style={{ fontSize: "0.8rem", marginTop: "0.15rem" }}>
              {season?.label_hi ?? ""}
            </p>
          </div>
          <span className="chip chip-verify" title="तिथि – पंचांग API से जुड़ेगी">
            तिथि शीघ्र
          </span>
        </div>

        <div className="divider-gold" style={{ margin: "0.75rem 0" }} />

        {/* Aarti list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {slots.length === 0 ? (
            <p className="text-muted" style={{ textAlign: "center", padding: "1rem" }}>
              आज दर्शन उपलब्ध नहीं है
            </p>
          ) : (
            slots.map((slot) => (
              <div key={slot.id} className="aarti-row">
                <span className="aarti-time">{formatTime(slot.start)}</span>
                <span className="aarti-name">{slot.name_hi}</span>
                {slot.verify && (
                  <span className="chip chip-verify" title="समिति से पुष्टि अपेक्षित">
                    verify
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Last updated note */}
        <p
          className="text-muted"
          style={{ fontSize: "0.72rem", textAlign: "right", marginTop: "0.75rem" }}
        >
          * समय की पुष्टि मंदिर समिति से करें
        </p>
      </div>
    </section>
  );
}
