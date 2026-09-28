"use client";

import React, { useState, useEffect } from "react";
import type { Closure } from "@jd/shared";

export default function AdminClosuresPage() {
  const [closures, setClosures] = useState<Closure[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [messageHi, setMessageHi] = useState("विशेष सेवा के कारण आज दर्शन पट बंद रहेंगे।");
  const [messageEn, setMessageEn] = useState("Darshan will remain closed today due to special seva.");
  const [notify, setNotify] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchClosures = async () => {
    try {
      const res = await fetch("/api/admin/closures");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      if (data.closures) setClosures(data.closures);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosures();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/closures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `${from}T00:00:00.000Z`,
          to: `${to}T23:59:59.000Z`,
          message_hi: messageHi,
          message_en: messageEn,
          notifySubscribers: notify,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback("✅ पट बंदी आदेश दर्ज कर दिया गया है।");
        fetchClosures();
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
    if (!confirm("क्या आप इस पट बंदी आदेश को निरस्त करना चाहते हैं?")) return;
    try {
      await fetch(`/api/admin/closures?id=${id}`, { method: "DELETE" });
      fetchClosures();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>
          🚫 पट बंदी प्रबंधन (Closures)
        </h1>
        <p className="text-secondary" style={{ fontSize: "0.85rem" }}>
          ग्रहण, मंदिर में विशेष सेवा, जीर्णोद्धार या अपरिहार्य कारणों से दर्शन बंद की घोषणा।
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

      {/* New closure form */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#FF8A80" }}>
          ➕ नई पट बंदी आदेश दर्ज करें
        </h2>
        <form onSubmit={handleCreate}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
                प्रारंभ तारीख़ (From Date)
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
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
                समाप्ति तारीख़ (To Date)
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
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
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
              पट बंद रहने का कारण व संदेश (हिंदी)
            </label>
            <input
              type="text"
              value={messageHi}
              onChange={(e) => setMessageHi(e.target.value)}
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

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
              />
              <span style={{ fontSize: "0.85rem", color: "var(--color-gold-light)" }}>
                भक्तों को मोबाइल पर तुरंत सूचना (Push Notification) भेजें
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{
              background: "linear-gradient(135deg, #C62828, #E53935)",
              padding: "0.5rem 1.4rem",
            }}
          >
            {submitting ? "आदेश दर्ज हो रहा है..." : "पट बंदी लागू करें"}
          </button>
        </form>
      </div>

      {/* Closures list */}
      <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>वर्तमान पट बंदी आदेश</h2>
      {closures.length === 0 ? (
        <div className="card text-secondary" style={{ fontSize: "0.85rem" }}>
          कोई पट बंदी सक्रिय नहीं है। मंदिर में नियमित दर्शन सुचारू रूप से चल रहे हैं।
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {closures.map((cl) => (
            <div
              key={cl.id}
              className="card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.5rem",
                borderLeft: "4px solid #E53935",
              }}
            >
              <div>
                <span className="chip" style={{ fontSize: "0.75rem", background: "rgba(229,57,53,0.2)", color: "#FF8A80", marginRight: "0.5rem" }}>
                  📅 {cl.from.slice(0, 10)} से {cl.to.slice(0, 10)}
                </span>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, marginTop: "0.4rem" }}>
                  {cl.message_hi}
                </div>
              </div>
              <button
                onClick={() => handleDelete(cl.id)}
                className="btn btn-secondary"
                style={{ color: "#81C784", fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
              >
                पट पुनः खोलें (Remove)
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
