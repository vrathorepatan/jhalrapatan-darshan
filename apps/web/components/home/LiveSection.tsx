"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface LiveStatusData {
  isLive: boolean;
  currentAarti: { name_hi: string; name_en: string; endsAt: string } | null;
  nextAarti: { name_hi: string; name_en: string; startsAt: string } | null;
  youtubeVideoId: string | null;
  facebookVideoUrl: string | null;
  closureMessage: string | null;
  streamHealthy: boolean;
}

function CountdownTimer({ targetIso }: { targetIso: string }) {
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    const update = () => {
      setDiff(Math.max(0, new Date(targetIso).getTime() - Date.now()));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);

  return (
    <div className="countdown" role="timer" aria-label="अगली आरती में समय">
      {hours > 0 && (
        <div className="countdown-block">
          <span className="countdown-value">{String(hours).padStart(2, "0")}</span>
          <span className="countdown-label">घंटे</span>
        </div>
      )}
      <div className="countdown-block">
        <span className="countdown-value">{String(minutes).padStart(2, "0")}</span>
        <span className="countdown-label">मिनट</span>
      </div>
      <div className="countdown-block">
        <span className="countdown-value">{String(seconds).padStart(2, "0")}</span>
        <span className="countdown-label">सेकंड</span>
      </div>
    </div>
  );
}

function getDemoStatus(): LiveStatusData {
  return {
    isLive: false,
    currentAarti: null,
    nextAarti: {
      name_hi: "सन्ध्या आरती",
      name_en: "Sandhya Aarti",
      startsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    },
    youtubeVideoId: null,
    facebookVideoUrl: null,
    closureMessage: null,
    streamHealthy: false,
  };
}

export function LiveSection() {
  const [status, setStatus] = useState<LiveStatusData>(getDemoStatus());
  const [isSticky, setIsSticky] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/live-status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 20_000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  // Scroll detection for sticky mini-player
  useEffect(() => {
    const handleScroll = () => {
      if (!playerRef.current) return;
      const rect = playerRef.current.getBoundingClientRect();
      // If player scrolled off screen and is live, make mini-player
      if (rect.bottom < 0 && status.isLive) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [status.isLive]);

  const handleShareWhatsApp = () => {
    const message = status.isLive
      ? `🚩 श्री द्वारकाधीश मंदिर, झालरापाटन से सीधा प्रसारण (लाइव दर्शन) देखें:\n${window.location.origin}`
      : `🚩 श्री द्वारकाधीश मंदिर, झालरापाटन के दैनिक दर्शन, आरती समय व उत्सव की जानकारी:\n${window.location.origin}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  const youtubeUrl = status.youtubeVideoId
    ? `https://www.youtube.com/watch?v=${status.youtubeVideoId}`
    : "https://www.youtube.com/@DwarkadhishJhalrapatan/live";

  const facebookUrl = status.facebookVideoUrl || "https://facebook.com/dwarkadhish.jhalrapatan/live";

  return (
    <section aria-label="लाइव दर्शन" style={{ marginBottom: "1.5rem" }}>
      {/* Player Anchor */}
      <div ref={playerRef}>
        <div className={`player-container${status.isLive ? " live" : ""}`}>
          {status.isLive && status.youtubeVideoId ? (
            <iframe
              id="live-player-iframe"
              src={`https://www.youtube.com/embed/${status.youtubeVideoId}?autoplay=1&rel=0`}
              title="लाइव दर्शन – श्री द्वारकाधीश मंदिर"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          ) : (
            <div className="player-offline-overlay">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden="true"
              >
                <ellipse cx="32" cy="48" rx="18" ry="6" fill="#C9A84C22" />
                <path
                  d="M22 42 Q24 30 32 28 Q40 30 42 42 Q38 46 32 47 Q26 46 22 42Z"
                  fill="#C9A84C"
                  opacity="0.8"
                />
                <path
                  d="M29 28 Q32 10 35 28"
                  stroke="#F5D87E"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <ellipse cx="32" cy="14" rx="3" ry="5" fill="#F5D87E" opacity="0.9" />
                <ellipse cx="32" cy="12" rx="2" ry="3" fill="#FFF7D6" opacity="0.7" />
              </svg>

              {status.closureMessage ? (
                <div style={{ textAlign: "center", padding: "0 1rem" }}>
                  <p
                    className="text-hindi"
                    style={{ color: "#F5D87E", fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    {status.closureMessage}
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "0 1rem" }}>
                  <p
                    className="text-hindi"
                    style={{ color: "#F5D87E", fontSize: "1.15rem", marginBottom: "0.5rem" }}
                  >
                    पट बंद हैं
                  </p>
                  <p className="text-muted" style={{ fontSize: "0.8rem" }}>
                    अभी दर्शन उपलब्ध नहीं है
                  </p>
                </div>
              )}
            </div>
          )}

          {status.isLive && (
            <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem" }}>
              <span className="badge-live">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Mini Player when scrolled */}
      {isSticky && status.isLive && status.youtubeVideoId && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "16px",
            width: "220px",
            height: "124px",
            zIndex: 50,
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
            border: "2px solid var(--color-gold)",
            background: "#000",
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${status.youtubeVideoId}?autoplay=1&mute=1&rel=0`}
            title="लाइव दर्शन मिनी प्लेयर"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
          <button
            onClick={() => setIsSticky(false)}
            aria-label="मिनी प्लेयर बंद करें"
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Status below player */}
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        {status.isLive && status.currentAarti ? (
          <div>
            <p
              className="text-hindi"
              style={{ fontSize: "1.2rem", color: "#F5D87E", marginBottom: "0.25rem" }}
            >
              🔴 {status.currentAarti.name_hi} (सीधा प्रसारण)
            </p>
            <p className="text-muted" style={{ fontSize: "0.8rem" }}>
              समाप्ति समय: {status.currentAarti.endsAt}
            </p>
          </div>
        ) : status.nextAarti ? (
          <div>
            <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
              अगली आरती:{" "}
              <span className="text-hindi" style={{ color: "#C9A84C", fontWeight: 600 }}>
                {status.nextAarti.name_hi}
              </span>
            </p>
            <CountdownTimer targetIso={status.nextAarti.startsAt} />
          </div>
        ) : (
          <p className="text-muted" style={{ fontSize: "0.85rem" }}>
            आज के लिए दर्शन समाप्त हो गए हैं। कल प्रातः पधारें।
          </p>
        )}
      </div>

      {/* Action Buttons: YouTube, Facebook, WhatsApp Share */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "1.25rem",
        }}
      >
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{
            fontSize: "0.8rem",
            padding: "0.45rem 0.85rem",
            color: "#FF4444",
            borderColor: "rgba(255,68,68,0.3)",
          }}
        >
          ▶ YouTube पर देखें
        </a>

        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{
            fontSize: "0.8rem",
            padding: "0.45rem 0.85rem",
            color: "#4A90E2",
            borderColor: "rgba(74,144,226,0.3)",
          }}
        >
          📘 Facebook पर देखें
        </a>

        <button
          onClick={handleShareWhatsApp}
          className="btn btn-secondary"
          style={{
            fontSize: "0.8rem",
            padding: "0.45rem 0.85rem",
            color: "#25D366",
            borderColor: "rgba(37,211,102,0.3)",
          }}
        >
          💬 WhatsApp शेयर
        </button>
      </div>
    </section>
  );
}
