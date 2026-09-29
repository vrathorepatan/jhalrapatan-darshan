"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer
      style={{
        marginTop: "2.5rem",
        borderTop: "1px solid var(--color-bg-border)",
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFFDF9 100%)",
      }}
    >
      <div
        className="container"
        style={{
          textAlign: "center",
          padding: "2rem 1rem 3.5rem",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginBottom: "0.4rem",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>🛕</span>
          <span
            className="text-hindi"
            style={{
              fontSize: "1.05rem",
              color: "var(--color-heading)",
              fontWeight: 700,
            }}
          >
            श्री द्वारकाधीश मंदिर दर्शन सेवा
          </span>
          <span style={{ fontSize: "1.2rem" }}>🚩</span>
        </div>

        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--color-text-secondary)",
            marginBottom: "0.75rem",
          }}
        >
          झालरापाटन (झालावाड़, राजस्थान) • पावन धर्मधरा एवं घंटियों का नगर
        </p>

        <div className="divider-gold" style={{ margin: "0.75rem auto 1rem", maxWidth: "260px" }} />

        {/* Development & Maintenance Credits */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.45rem",
            fontSize: "0.86rem",
            maxWidth: "480px",
            margin: "0 auto",
            background: "var(--color-bg-subtle)",
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid #FED7AA",
          }}
        >
          <div>
            <span style={{ color: "var(--color-text-muted)" }}>तकनीकी संकल्पना एवं विकास: </span>
            <strong style={{ color: "var(--color-heading)", fontWeight: 700 }}>
              विनोद राठौर
            </strong>
            <span style={{ color: "var(--color-saffron)", fontSize: "0.75rem", fontWeight: 600 }}>
              {" "}(Developed by Vinod Rathore)
            </span>
          </div>

          <div>
            <span style={{ color: "var(--color-text-muted)" }}>सेवा, संपादन एवं प्रबंधन: </span>
            <strong style={{ color: "var(--color-heading)", fontWeight: 700 }}>
              पं. राजेंद्र शास्त्री
            </strong>
            <span style={{ color: "var(--color-gold)", fontSize: "0.75rem", fontWeight: 600 }}>
              {" "}(Maintained by Rajendra Shastri)
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: "0.74rem",
            color: "var(--color-text-muted)",
            marginTop: "1.25rem",
          }}
        >
          © {new Date().getFullYear()} झालरापाटन दर्शन • सर्व मंगल की कामना सहित समर्पित
        </p>
      </div>
    </footer>
  );
}
