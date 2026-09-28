"use client";

import { useState } from "react";

export function PushOptIn() {
  const [state, setState] = useState<"idle" | "prompt" | "subscribed" | "denied" | "unsupported">(
    typeof window !== "undefined" && !("Notification" in window)
      ? "unsupported"
      : "idle"
  );

  if (state === "subscribed" || state === "unsupported") return null;

  const handleRequest = async () => {
    if (!("Notification" in window)) {
      setState("unsupported");
      return;
    }

    setState("prompt");

    // iOS guidance: show instructions before requesting
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !("standalone" in navigator && (navigator as { standalone?: boolean }).standalone)) {
      // Show iOS instruction – handled by UI below
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // TODO (Milestone 7): Subscribe with VAPID and POST to /api/push/subscribe
      setState("subscribed");
    } else {
      setState("denied");
    }
  };

  const isIOS =
    typeof window !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    state === "prompt";

  return (
    <div className="card" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
      <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🔔</p>

      {isIOS ? (
        <div>
          <p className="text-hindi" style={{ color: "#F5D87E", marginBottom: "0.5rem" }}>
            iPhone पर सूचना पाने के लिए:
          </p>
          <ol
            style={{
              textAlign: "left",
              color: "var(--color-text-secondary)",
              paddingLeft: "1.25rem",
              fontSize: "0.875rem",
              lineHeight: 2,
            }}
          >
            <li>Safari में नीचे <strong style={{ color: "#C9A84C" }}>Share</strong> बटन दबाएं</li>
            <li>&ldquo;<strong style={{ color: "#C9A84C" }}>Add to Home Screen</strong>&rdquo; चुनें</li>
            <li>Home Screen से ऐप खोलें और फिर सूचना चालू करें</li>
          </ol>
        </div>
      ) : state === "denied" ? (
        <p className="text-secondary" style={{ fontSize: "0.875rem" }}>
          सूचना की अनुमति नहीं दी गई। ब्राउज़र सेटिंग से बदलें।
        </p>
      ) : (
        <div>
          <p className="text-hindi" style={{ color: "#F5D87E", marginBottom: "0.35rem" }}>
            दर्शन की सूचना पाएं
          </p>
          <p className="text-muted" style={{ fontSize: "0.8rem", marginBottom: "1rem" }}>
            आरती से 10 मिनट पहले और लाइव होने पर सूचना मिलेगी
          </p>
          <button
            id="push-optin-btn"
            className="btn-primary"
            onClick={handleRequest}
            aria-label="आरती सूचना चालू करें"
          >
            🔔 सूचना चालू करें
          </button>
        </div>
      )}
    </div>
  );
}
