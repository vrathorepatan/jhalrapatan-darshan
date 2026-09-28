"use client";

import React, { useState, useEffect } from "react";
import type { Override } from "@jd/shared";

export default function AdminOverridesPage() {
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<"modify" | "add" | "remove" | "closed">("modify");
  const [slotId, setSlotId] = useState("rajbhog");
  const [nameHi, setNameHi] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:30");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchOverrides = async () => {
    try {
      const res = await fetch("/api/admin/overrides");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      if (data.overrides) setOverrides(data.overrides);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverrides();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const payload: Partial<Override> = {
      date,
      type,
      slotId: type !== "closed" && type !== "add" ? slotId : undefined,
      message_hi: message || undefined,
    };

    if (type === "modify" || type === "add") {
      payload.slot = {
        id: type === "add" ? `extra-${Date.now()}` : slotId,
        name_hi: nameHi || (type === "add" ? "विशेष आरती" : slotId),
        name_en: type === "add" ? "Special Aarti" : slotId,
        start: startTime,
        end: endTime,
        enabled: true,
        startOffsetMin: 2,
      };
    }

    try {
      const res = await fetch("/api/admin/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback("✅ फेरबदल दर्ज कर लिया गया है।");
        fetchOverrides();
        setMessage("");
      } else {
        setFeedback("❌ त्रुटि: " + (data.error || "विफल"));
      }
    } catch {
      setFeedback("❌ नेटवर्क त्रुटि");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("क्या आप इस फेरबदल को हटाना चाहते हैं?")) return;
    try {
      await fetch(`/api/admin/overrides?id=${id}`, { method: "DELETE" });
      fetchOverrides();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>
          🔄 विशेष फेरबदल प्रबंधन (Date Overrides)
        </h1>
        <p className="text-secondary" style={{ fontSize: "0.85rem" }}>
          त्योहारों या विशेष अवसरों पर किसी निश्चित तारीख के लिए समय बदलें या आरती जोड़ें।
        </p>
      </div>

      {feedback && (
        <div
          className="card"
          style={{
            marginBottom: "1.5rem",
            background: feedback.startsWith("✅") ? "rgba(46,125,50,0.2)" : "rgba(198,40,40,0.2)",
            borderColor: feedback.startsWith("✅") ? "#81C784" : "#E57373",
          }}
        >
          {feedback}
        </div>
      )}

      {/* Create form */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--color-gold-light)" }}>
          ➕ नया फेरबदल जोड़ें
        </h2>
        <form onSubmit={handleCreate}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
                तारीख़ (Date)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  background: "var(--color-bg-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  color: "white",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
                प्रकार (Type)
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  background: "var(--color-bg-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  color: "white",
                }}
              >
                <option value="modify">समय बदलें (Modify Slot Time)</option>
                <option value="add">अतिरिक्त आरती जोड़ें (Add Extra Slot)</option>
                <option value="remove">आरती हटाएं (Remove Slot)</option>
                <option value="closed">पूरे दिन पट बंद (Full Day Closed)</option>
              </select>
            </div>

            {type !== "closed" && type !== "add" && (
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
                  आरती चुनें
                </label>
                <select
                  value={slotId}
                  onChange={(e) => setSlotId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    background: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    color: "white",
                  }}
                >
                  <option value="mangla">मंगला आरती (Mangla)</option>
                  <option value="shringar">श्रृंगार आरती (Shringar)</option>
                  <option value="rajbhog">राजभोग आरती (Rajbhog)</option>
                  <option value="utthapan">उत्थापन आरती (Utthapan)</option>
                  <option value="sandhya">सन्ध्या आरती (Sandhya)</option>
                  <option value="shayan">शयन आरती (Shayan)</option>
                </select>
              </div>
            )}

            {(type === "modify" || type === "add") && (
              <>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
                    नया प्रारंभ समय
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      background: "var(--color-bg-primary)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      color: "white",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
                    नया समाप्ति समय
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      background: "var(--color-bg-primary)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      color: "white",
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
              टिप्पणी / संदेश (भक्तों को दिखाने हेतु)
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="उदा. जन्माष्टमी विशेष समय..."
              style={{
                width: "100%",
                padding: "0.5rem",
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                color: "white",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ padding: "0.5rem 1.25rem" }}
          >
            {submitting ? "सहेजा जा रहा है..." : "फेरबदल लागू करें"}
          </button>
        </form>
      </div>

      {/* List */}
      <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>सक्रिय फेरबदल सूची (Active Overrides)</h2>
      {overrides.length === 0 ? (
        <div className="card text-secondary" style={{ fontSize: "0.85rem" }}>
          कोई विशेष फेरबदल दर्ज नहीं है। नियमित समय सारणी प्रभावी है।
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {overrides.map((ov) => (
            <div
              key={ov.id}
              className="card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div>
                <span
                  className="chip chip-gold"
                  style={{ fontSize: "0.75rem", marginRight: "0.5rem" }}
                >
                  📅 {ov.date}
                </span>
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  प्रकार: {ov.type.toUpperCase()}
                </span>
                {ov.slot && (
                  <span className="text-secondary" style={{ fontSize: "0.8rem", marginLeft: "0.5rem" }}>
                    ({ov.slot.name_hi}: {ov.slot.start} - {ov.slot.end})
                  </span>
                )}
                {ov.message_hi && (
                  <div style={{ fontSize: "0.8rem", color: "var(--color-gold-light)", marginTop: "0.25rem" }}>
                    💬 {ov.message_hi}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(ov.id)}
                className="btn btn-secondary"
                style={{ color: "#FF7B7B", fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}
              >
                हटाएं
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
