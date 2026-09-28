"use client";

import React, { useState, useEffect } from "react";
import type { AuditLogEntry } from "@/lib/db";

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/audit-log");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      if (data.auditLogs) setLogs(data.auditLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>
          📜 परिवर्तन एवं ऑडिट लॉग (Audit Log)
        </h1>
        <p className="text-secondary" style={{ fontSize: "0.85rem" }}>
          समय परिवर्तन, पट बंदी, लाइव प्रसारण और बॉट गतिविधियों का संपूर्ण लेखा-जोखा (Read-only)।
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
                <th style={{ padding: "0.75rem 1rem" }}>समय (Timestamp)</th>
                <th style={{ padding: "0.75rem 1rem" }}>कार्रवाई (Action)</th>
                <th style={{ padding: "0.75rem 1rem" }}>विवरण (Details)</th>
                <th style={{ padding: "0.75rem 1rem" }}>कर्ता (Actor)</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap", color: "var(--color-text-muted)" }}>
                    {new Date(log.createdAt).toLocaleString("hi-IN")}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span className="chip chip-gold" style={{ fontSize: "0.75rem" }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--color-text-primary)" }}>
                    {log.details || "-"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--color-text-secondary)" }}>
                    {log.actor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
