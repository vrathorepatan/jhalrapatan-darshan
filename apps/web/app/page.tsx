import type { Metadata } from "next";
import { LiveSection } from "@/components/home/LiveSection";
import { TodayCard } from "@/components/home/TodayCard";
import { UtsavStrip } from "@/components/home/UtsavStrip";
import { PushOptIn } from "@/components/PushOptIn";

export const metadata: Metadata = {
  title: "लाइव दर्शन – श्री द्वारकाधीश मंदिर, झालरापाटन",
  description:
    "श्री द्वारकाधीश मंदिर, झालरापाटन का सीधा प्रसारण देखें। मंगला, श्रृंगार, राजभोग, सन्ध्या और शयन आरती लाइव।",
  openGraph: {
    title: "लाइव दर्शन – श्री द्वारकाधीश मंदिर",
    description: "झालरापाटन – लाइव आरती दर्शन",
  },
};

export default function HomePage() {
  return (
    <div className="container" style={{ paddingTop: "1rem" }}>
      {/* Hero heading */}
      <header style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "clamp(1.3rem,4vw,1.9rem)", marginBottom: "0.25rem" }}>
          🙏 श्री द्वारकाधीश मंदिर
        </h1>
        <p className="text-secondary" style={{ fontSize: "0.875rem" }}>
          झालरापाटन, राजस्थान
        </p>
      </header>

      {/* Live player + countdown */}
      <LiveSection />

      <div className="divider-gold" />

      {/* Today's schedule & tithi */}
      <TodayCard />

      <div className="divider-gold" />

      {/* Upcoming festivals strip */}
      <section aria-labelledby="utsav-heading" style={{ marginBottom: "1.5rem" }}>
        <div className="section-title">
          <h2 id="utsav-heading" style={{ fontSize: "1.1rem" }}>
            आगामी उत्सव
          </h2>
        </div>
        <UtsavStrip />
      </section>

      {/* Push notification opt-in */}
      <PushOptIn />

      {/* External links */}
      <section aria-label="बाहरी लिंक" style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            justifyContent: "center",
          }}
        >
          <a
            id="watch-youtube"
            href="https://www.youtube.com/@JhalrapatanDarshan"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            aria-label="YouTube पर देखें"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube
          </a>
          <a
            id="watch-facebook"
            href="https://facebook.com/JhalrapatanDarshan"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            aria-label="Facebook पर देखें"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </a>
          <a
            id="share-whatsapp"
            href="https://wa.me/?text=%F0%9F%99%8F%20%E0%A4%9D%E0%A4%BE%E0%A4%B2%E0%A4%B0%E0%A4%BE%E0%A4%AA%E0%A4%BE%E0%A4%9F%E0%A4%A8%20%E0%A4%A6%E0%A4%B0%E0%A5%8D%E0%A4%B6%E0%A4%A8%20-%20%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A5%80%20%E0%A4%A6%E0%A5%8D%E0%A4%B5%E0%A4%BE%E0%A4%B0%E0%A4%95%E0%A4%BE%E0%A4%A7%E0%A5%80%E0%A4%B6%20%E0%A4%AE%E0%A4%82%E0%A4%A6%E0%A4%BF%E0%A4%B0%20%E0%A4%B2%E0%A4%BE%E0%A4%87%E0%A4%B5%20%E0%A4%86%E0%A4%B0%E0%A4%A4%E0%A5%80"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            aria-label="WhatsApp पर शेयर करें"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
