"use client";

import React, { useState, useEffect } from "react";
import type { Announcement } from "@/lib/db";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageHi, setMessageHi] = useState("");
  const [messageEn, setMessageEn] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      if (data.announcements) setAnnouncements(data.announcements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_hi: messageHi,
          message_en: messageEn,
          active: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback("✅ सूचना पट्टी सहेज ली गई है।");
        setMessageHi("");
        setMessageEn("");
        fetchAnnouncements();
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
    if (!confirm("क्या आप इस सूचना को हटाना चाहते हैं?")) return;
    try {
      await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>
          📢 सूचना पट्टी प्रबंधन (Announcements)
        </h1>
        <p className="text-secondary" style={{ fontSize: "0.85rem" }}>
          भक्तों के लिए वेबसाइट के शीर्ष पर प्रदर्शित होने वाली विशेष घोषणाएं।
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

      {/* Add announcement */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--color-gold-light)" }}>
          ➕ नई सूचना जोड़ें
        </h2>
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
              सूचना पाठ (हिंदी)
            </label>
            <input
              type="text"
              value={messageHi}
              onChange={(e) => setMessageHi(e.target.value)}
              placeholder="उदा. आगामी 12 अक्टूबर को शरद पूर्णिमा महोत्सव विशेष दर्शन..."
              required
              style={{
                width: "100%",
                padding: "0.6rem",
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                color: "white",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
              सूचना पाठ (English) - वैकल्पिक
            </label>
            <input
              type="text"
              value={messageEn}
              onChange={(e) => setMessageEn(e.target.value)}
              placeholder="e.g. Special Sharad Purnima Darshan on Oct 12..."
              style={{
                width: "100%",
                padding: "0.6rem",
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
            style={{ padding: "0.5rem 1.4rem" }}
          >
            {submitting ? "सहेजा जा रहा है..." : "सूचना प्रकाशित करें"}
          </button>
        </form>
      </div>

      {/* Current announcements */}
      <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>सक्रिय सूचनाएं</h2>
      {announcements.length === 0 ? (
        <div className="card text-secondary" style={{ fontSize: "0.85rem" }}>
          कोई सूचना प्रकाशित नहीं है।
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {announcements.map((ann) => (
            <div
              key={ann.id}
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
                <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>{ann.message_hi}</div>
                {ann.message_en && (
                  <div className="text-secondary" style={{ fontSize: "0.8rem", marginTop: "0.2rem" }}>
                    {ann.message_en}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(ann.id)}
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
