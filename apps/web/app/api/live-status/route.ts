import { NextResponse } from "next/server";
import { getLiveState } from "@jd/shared";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const now = new Date();
    const db = readDb();

    // Calculate core live state from schedule engine
    const liveState = getLiveState(
      now,
      db.schedules,
      db.overrides,
      db.closures
    );

    // Heartbeat health check (healthy if reported within last 90s)
    const lastHeartbeatTime = db.heartbeat?.receivedAt
      ? new Date(db.heartbeat.receivedAt).getTime()
      : 0;
    const isHeartbeatFresh = Date.now() - lastHeartbeatTime < 90 * 1000;
    const streamHealthy = Boolean(db.heartbeat?.ingestConnected && isHeartbeatFresh);

    // Manual override check (e.g. from Admin or Telegram bot)
    let isLive = liveState.isLive;
    let currentAarti = liveState.currentSlot
      ? {
          id: liveState.currentSlot.id,
          name_hi: liveState.currentSlot.name_hi,
          name_en: liveState.currentSlot.name_en,
          endsAt: liveState.currentSlot.endsAt,
        }
      : null;

    if (db.heartbeat?.isManualLive) {
      isLive = true;
      if (!currentAarti) {
        currentAarti = {
          id: "manual-live",
          name_hi: db.heartbeat.manualLiveSlotName || "विशेष दर्शन",
          name_en: "Special Darshan",
          endsAt: "प्रसारण समाप्ति तक",
        };
      }
    }

    // Default YouTube Video ID / live channel or demo ID
    const defaultYoutubeId = process.env.YOUTUBE_LIVE_VIDEO_ID || process.env.NEXT_PUBLIC_DEFAULT_YOUTUBE_ID || "jfKfPfyJRdk";
    const defaultFacebookUrl = process.env.FACEBOOK_LIVE_URL || "https://facebook.com/dwarkadhish.jhalrapatan/live";

    const response = {
      isLive,
      currentAarti,
      nextAarti: liveState.nextSlot
        ? {
            id: liveState.nextSlot.id,
            name_hi: liveState.nextSlot.name_hi,
            name_en: liveState.nextSlot.name_en,
            startsAt: liveState.nextSlot.startsAt,
          }
        : null,
      youtubeVideoId: isLive ? defaultYoutubeId : null,
      facebookVideoUrl: isLive ? defaultFacebookUrl : null,
      closureMessage: liveState.closureMessage || null,
      streamHealthy,
      heartbeat: {
        bitrate: db.heartbeat?.bitrate || 0,
        uptime: db.heartbeat?.uptime || 0,
        lastSeen: db.heartbeat?.receivedAt || null,
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error generating live status:", error);
    return NextResponse.json(
      {
        isLive: false,
        currentAarti: null,
        nextAarti: {
          name_hi: "सन्ध्या आरती",
          name_en: "Sandhya Aarti",
          startsAt: new Date(Date.now() + 3600000).toISOString(),
        },
        youtubeVideoId: null,
        facebookVideoUrl: null,
        closureMessage: null,
        streamHealthy: false,
      },
      { status: 200 }
    );
  }
}
