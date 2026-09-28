"use client";

import React, { useState, useEffect } from "react";
import type { Schedule, Slot } from "@jd/shared";

export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/admin/schedule");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      if (data.schedules) {
        setSchedules(data.schedules);
      }
    } catch (err) {
      console.error("Failed to load schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotChange = (
    seasonIdx: number,
    slotIdx: number,
    field: keyof Slot,
    value: unknown
  ) => {
    const updated = [...schedules];
    updated[seasonIdx].slots[slotIdx] = {
      ...updated[seasonIdx].slots[slotIdx],
      [field]: value,
    };
    setSchedules(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ दर्शन समय सारणी सफलतापूर्वक सहेज ली गई है!");
      } else {
        setMessage("❌ त्रुटि: " + (data.error || "अपडेट विफल"));
      }
    } catch {
      setMessage("❌ नेटवर्क संपर्क में समस्या।");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card">समय सारणी लोड की जा रही है...</div>;
  }

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
          <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>
            ⏱️ नियमित दर्शन समय संपादक (Schedule Editor)
          </h1>
          <p className="text-secondary" style={{ fontSize: "0.85rem" }}>
            ग्रीष्मकालीन और शीतकालीन आरतियों के समय और स्थिति बदलें।
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ padding: "0.6rem 1.5rem", fontSize: "0.95rem" }}
        >
          {saving ? "सहेजा जा रहा है..." : "💾 परिवर्तन सहेजें (Save)"}
        </button>
      </div>

      {message && (
        <div
          className="card"
          style={{
            marginBottom: "1.5rem",
            background: message.startsWith("✅") ? "rgba(46,125,50,0.2)" : "rgba(198,40,40,0.2)",
            borderColor: message.startsWith("✅") ? "#81C784" : "#E57373",
          }}
        >
          {message}
        </div>
      )}

      {schedules.map((season, seasonIdx) => (
        <div key={season.id || season.season} className="card" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.2rem", color: "var(--color-gold-light)", marginBottom: "0.2rem" }}>
                {season.season === "summer" ? "☀️ ग्रीष्मकालीन समय (Summer)" : "❄️ शीतकालीन समय (Winter)"}
              </h2>
              <span className="text-secondary" style={{ fontSize: "0.8rem" }}>
                अवधि: {season.validFrom} से {season.validTo}
              </span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem 0.5rem" }}>आरती नाम (हिंदी)</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>अंग्रेजी नाम</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>प्रारंभ (Start)</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>समाप्ति (End)</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>प्रसारण स्थिति</th>
                </tr>
              </thead>
              <tbody>
                {season.slots.map((slot, slotIdx) => (
                  <tr
                    key={slot.id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      opacity: slot.enabled ? 1 : 0.5,
                    }}
                  >
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <input
                        type="text"
                        value={slot.name_hi}
                        onChange={(e) =>
                          handleSlotChange(seasonIdx, slotIdx, "name_hi", e.target.value)
                        }
                        style={{
                          background: "var(--color-bg-primary)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-sm)",
                          padding: "0.35rem 0.6rem",
                          color: "white",
                          width: "140px",
                        }}
                      />
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <input
                        type="text"
                        value={slot.name_en}
                        onChange={(e) =>
                          handleSlotChange(seasonIdx, slotIdx, "name_en", e.target.value)
                        }
                        style={{
                          background: "var(--color-bg-primary)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-sm)",
                          padding: "0.35rem 0.6rem",
                          color: "white",
                          width: "140px",
                        }}
                      />
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) =>
                          handleSlotChange(seasonIdx, slotIdx, "start", e.target.value)
                        }
                        style={{
                          background: "var(--color-bg-primary)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-sm)",
                          padding: "0.35rem 0.6rem",
                          color: "white",
                        }}
                      />
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) =>
                          handleSlotChange(seasonIdx, slotIdx, "end", e.target.value)
                        }
                        style={{
                          background: "var(--color-bg-primary)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-sm)",
                          padding: "0.35rem 0.6rem",
                          color: "white",
                        }}
                      />
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={slot.enabled}
                          onChange={(e) =>
                            handleSlotChange(seasonIdx, slotIdx, "enabled", e.target.checked)
                          }
                        />
                        <span style={{ fontSize: "0.8rem" }}>
                          {slot.enabled ? "सक्रिय (On)" : "निष्क्रिय (Off)"}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
