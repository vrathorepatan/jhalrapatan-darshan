import dotenv from "dotenv";
import { FFmpegManager } from "./ffmpeg-manager.js";
import { YouTubeService } from "./youtube-service.js";
import { FacebookService } from "./facebook-service.js";
import { HeartbeatReporter } from "./heartbeat.js";

dotenv.config();

const CAMERA_URL = process.env.CAMERA_URL || "rtsp://admin:pass@192.168.1.100:554/stream";
const YOUTUBE_RTMP_URL = process.env.YOUTUBE_RTMP_URL || "rtmp://a.rtmp.youtube.com/live2";
const YOUTUBE_STREAM_KEY = process.env.YOUTUBE_STREAM_KEY || "mock-stream-key";
const FACEBOOK_RTMP_URL = process.env.FACEBOOK_RTMP_URL;
const FACEBOOK_STREAM_KEY = process.env.FACEBOOK_STREAM_KEY;

const WEB_API_URL = process.env.WEB_API_URL || "http://localhost:3000";
const STREAM_CONTROLLER_TOKEN = process.env.STREAM_CONTROLLER_TOKEN || "jd-secret-stream-token";
const ALWAYS_ON = (process.env.ALWAYS_ON || "true").toLowerCase() === "true";
const VIDEO_BITRATE_KBPS = parseInt(process.env.VIDEO_BITRATE_KBPS || "2800", 10);

console.log("=================================================");
console.log("  🚩 Jhalrapatan Darshan - Stream Controller     ");
console.log("  Shri Dwarkadhish Mandir, Jhalrapatan           ");
console.log("=================================================");
console.log(`• Mode: ${ALWAYS_ON ? "24x7 Ingest (Always On)" : "Scheduled Ingest"}`);
console.log(`• Bitrate: ${VIDEO_BITRATE_KBPS} kbps`);
console.log(`• Web API: ${WEB_API_URL}`);

// 1. Initialize FFmpeg Manager
const ffmpeg = new FFmpegManager(
  CAMERA_URL,
  YOUTUBE_RTMP_URL,
  YOUTUBE_STREAM_KEY,
  FACEBOOK_RTMP_URL,
  FACEBOOK_STREAM_KEY,
  VIDEO_BITRATE_KBPS
);

// 2. Initialize Platform Services
const youtube = new YouTubeService(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REFRESH_TOKEN,
  process.env.YOUTUBE_PERSISTENT_STREAM_ID
);

const facebook = new FacebookService(
  process.env.FACEBOOK_PAGE_ID,
  process.env.FACEBOOK_PAGE_ACCESS_TOKEN
);

// 3. Initialize Heartbeat
const heartbeat = new HeartbeatReporter(
  WEB_API_URL,
  STREAM_CONTROLLER_TOKEN,
  () => ffmpeg.getStats(),
  30000
);

// If ALWAYS_ON, start FFmpeg immediately
if (ALWAYS_ON) {
  ffmpeg.start();
}
heartbeat.start();

// 4. Scheduler Loop
let activeBroadcastId: string | null = null;
let activeFacebookVideoId: string | null = null;
let currentLiveSlotId: string | null = null;

async function checkScheduleCycle() {
  try {
    const res = await fetch(`${WEB_API_URL.replace(/\/$/, "")}/api/live-status`, {
      cache: "no-store",
    });
    if (!res.ok) return;

    const data = await res.json();
    const isLive = Boolean(data.isLive);
    const currentAarti = data.currentAarti;
    const closureMessage = data.closureMessage;

    // Handle Closure: if temple is closed, ensure broadcasts are stopped
    if (closureMessage && (activeBroadcastId || currentLiveSlotId)) {
      console.warn(`[CONTROLLER] Closure detected: "${closureMessage}". Ending active streams.`);
      if (activeBroadcastId) {
        await youtube.transitionBroadcast(activeBroadcastId, "complete");
        activeBroadcastId = null;
      }
      if (activeFacebookVideoId) {
        await facebook.endLiveVideo(activeFacebookVideoId);
        activeFacebookVideoId = null;
      }
      currentLiveSlotId = null;
      if (!ALWAYS_ON) ffmpeg.stop();
      return;
    }

    // Handle slot start
    if (isLive && currentAarti && currentLiveSlotId !== currentAarti.name_hi) {
      console.log(`[CONTROLLER] Starting live broadcast for: ${currentAarti.name_hi}`);
      currentLiveSlotId = currentAarti.name_hi;

      if (!ALWAYS_ON) {
        ffmpeg.start();
      }

      // YouTube transition
      const title = `श्री द्वारकाधीश मंदिर, झालरापाटन – ${currentAarti.name_hi}`;
      const description = `श्री द्वारकाधीश मंदिर, झालरापाटन (राजस्थान) से सीधा प्रसारण (Live Darshan).\nआरती: ${currentAarti.name_hi}\nदर्शन समय व जानकारी: ${WEB_API_URL}`;

      const now = new Date();
      const end = new Date(now.getTime() + 45 * 60 * 1000);
      const bId = await youtube.createBroadcast(
        title,
        description,
        now.toISOString(),
        end.toISOString()
      );
      if (bId) {
        activeBroadcastId = bId;
        await youtube.transitionBroadcast(bId, "live");
      }

      // Facebook Live Video
      const fb = await facebook.createLiveVideo(title, description);
      if (fb) {
        activeFacebookVideoId = fb.id;
      }
    }

    // Handle slot end
    if (!isLive && currentLiveSlotId) {
      console.log(`[CONTROLLER] Ending live broadcast for: ${currentLiveSlotId}`);
      if (activeBroadcastId) {
        await youtube.transitionBroadcast(activeBroadcastId, "complete");
        activeBroadcastId = null;
      }
      if (activeFacebookVideoId) {
        await facebook.endLiveVideo(activeFacebookVideoId);
        activeFacebookVideoId = null;
      }
      currentLiveSlotId = null;

      if (!ALWAYS_ON) {
        ffmpeg.stop();
      }
    }
  } catch (err: any) {
    console.error("[CONTROLLER LOOP ERROR]", err.message);
  }
}

// Run schedule check every 30 seconds
const scheduleInterval = setInterval(checkScheduleCycle, 30000);
checkScheduleCycle();

// 5. Graceful Shutdown
function handleShutdown(signal: string) {
  console.log(`\n[CONTROLLER] Received ${signal}. Shutting down cleanly...`);
  clearInterval(scheduleInterval);
  heartbeat.stop();
  ffmpeg.stop();
  process.exit(0);
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
