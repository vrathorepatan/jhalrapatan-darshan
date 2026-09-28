import festivalsData from "../../../../data/festivals.json";

export function UtsavStrip() {
  // Show first 3 festivals as upcoming (real date-based filtering in Milestone 3)
  const upcoming = festivalsData.slice(0, 3);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "0.75rem",
      }}
    >
      {upcoming.map((festival) => (
        <a
          key={festival.id}
          href="/utsav"
          style={{ textDecoration: "none" }}
          aria-label={festival.name_hi}
        >
          <div
            className="card"
            style={{
              padding: "0.85rem 0.75rem",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <p
              className="text-hindi"
              style={{
                fontSize: "0.9rem",
                color: "#F5D87E",
                marginBottom: "0.25rem",
                lineHeight: 1.3,
              }}
            >
              {festival.name_hi}
            </p>
            <p className="text-muted" style={{ fontSize: "0.7rem" }}>
              {festival.tithi.split(" ").slice(0, 2).join(" ")}
            </p>
            {festival.verify && (
              <span className="chip chip-verify" style={{ marginTop: "0.4rem", fontSize: "0.6rem" }}>
                verify
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
