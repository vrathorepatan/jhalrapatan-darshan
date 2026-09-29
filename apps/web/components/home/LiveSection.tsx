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
            <div className="player-offline-overlay" style={{ padding: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1.25rem",
                  width: "100%",
                  maxWidth: "480px",
                }}
              >
                {/* Dwarkadhish Ji Divine Photo Frame */}
                <div
                  style={{
                    position: "relative",
                    width: "105px",
                    height: "135px",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    border: "2.5px solid #F59E0B",
                    boxShadow: "0 6px 20px rgba(230,81,0,0.25)",
                    flexShrink: 0,
                    background: "#1C1914",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/dwarkadhish.jpg"
                    alt="श्री द्वारकाधीश जी के दर्शन"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "rgba(0,0,0,0.65)",
                      color: "#FFF",
                      fontSize: "0.62rem",
                      textAlign: "center",
                      padding: "2px 0",
                      fontWeight: 600,
                    }}
                  >
                    नित्य दर्शन
                  </span>
                </div>

                {/* Status Text & Message */}
                <div style={{ textAlign: "left", flex: 1 }}>
                  {status.closureMessage ? (
                    <div>
                      <span
                        style={{
                          background: "#FFF0DE",
                          color: "var(--color-saffron)",
                          border: "1px solid #FED7AA",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "9999px",
                          display: "inline-block",
                          marginBottom: "0.4rem",
                        }}
                      >
                        ⚠️ सूचना
                      </span>
                      <h3
                        className="text-hindi"
                        style={{ color: "var(--color-heading)", fontSize: "1.15rem", fontWeight: 700, margin: "0 0 0.25rem" }}
                      >
                        {status.closureMessage}
                      </h3>
                      <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", margin: 0 }}>
                        दर्शन समय की पुष्टि मंदिर समिति से करें
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span
                        style={{
                          background: "#FFF0DE",
                          color: "var(--color-saffron)",
                          border: "1px solid #FED7AA",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "9999px",
                          display: "inline-block",
                          marginBottom: "0.4rem",
                        }}
                      >
                        🚩 श्री द्वारकाधीश जी
                      </span>
                      <h3
                        className="text-hindi"
                        style={{ color: "var(--color-heading)", fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.25rem" }}
                      >
                        🙏 पट अभी मंगल हैं
                      </h3>
                      <p style={{ fontSize: "0.84rem", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.4 }}>
                        अगली आरती के समय सीधा प्रसारण (लाइव दर्शन) आरंभ होगा।
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
            boxShadow: "0 8px 24px rgba(230,81,0,0.25)",
            border: "2px solid var(--color-saffron)",
            background: "#FFFFFF",
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
              style={{ fontSize: "1.25rem", color: "var(--color-heading)", fontWeight: 700, marginBottom: "0.25rem" }}
            >
              🔴 {status.currentAarti.name_hi} (सीधा प्रसारण)
            </p>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>
              समाप्ति समय: {status.currentAarti.endsAt}
            </p>
          </div>
        ) : status.nextAarti ? (
          <div>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: "0.75rem" }}>
              अगली आरती:{" "}
              <span className="text-hindi" style={{ color: "var(--color-saffron)", fontWeight: 700, fontSize: "1.05rem" }}>
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
          gap: "0.6rem",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "1.25rem",
        }}
      >
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{
            fontSize: "0.82rem",
            padding: "0.5rem 1rem",
            color: "#DC2626",
            borderColor: "#FECACA",
            background: "#FEF2F2",
          }}
        >
          ▶ YouTube पर देखें
        </a>

        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{
            fontSize: "0.82rem",
            padding: "0.5rem 1rem",
            color: "#1D4ED8",
            borderColor: "#BFDBFE",
            background: "#EFF6FF",
          }}
        >
          📘 Facebook पर देखें
        </a>

        <button
          onClick={handleShareWhatsApp}
          className="btn-secondary"
          style={{
            fontSize: "0.82rem",
            padding: "0.5rem 1rem",
            color: "#15803D",
            borderColor: "#BBF7D0",
            background: "#F0FDF4",
          }}
        >
          💬 WhatsApp शेयर
        </button>
      </div>
    </section>
  );
}
