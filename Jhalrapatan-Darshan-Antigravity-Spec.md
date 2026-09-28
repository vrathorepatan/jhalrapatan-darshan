# Jhalrapatan Darshan – Project Specification (for Antigravity)

> Paste or attach this file to Antigravity. Ask it to **plan first** (pages, components, data schema, services, milestones), wait for approval, then build milestone by milestone and test each one in the browser.

---

## 1. Project Overview

**App name:** Jhalrapatan Darshan (Hindi: झालरापाटन दर्शन)

**Purpose:** A mobile-first, installable web app (PWA) where devotees can:

1. Watch live darshan of **Shri Dwarkadhish Mandir, Jhalrapatan (Rajasthan)** on a fixed daily schedule.
2. See temple information: darshan timings, tithi, festivals (utsav), history, how to reach, rules.
3. Explore all notable temples of Jhalrapatan with details, photos and a map.
4. Get push notifications before and at the start of each darshan.

**Key behaviour:** The temple camera streams **24x7 to the ingest servers**, but the stream is made **public (live) only during scheduled darshan times**, on **YouTube, Facebook and the website** together. The schedule can be changed or cancelled by the temple staff at any time through a simple admin panel or a Telegram bot.

**Audience:** Devotees of all ages, many on low-end Android phones and slow mobile networks. Hindi is the default language.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Web app | Next.js (App Router) + TypeScript + Tailwind CSS |
| Database | Supabase (Postgres) or SQLite via Prisma – must store schedule, overrides, push subscriptions, audit log, stream status |
| Stream controller | Node.js + TypeScript service in `/stream-controller`, runs at the temple on a mini PC / Raspberry Pi 5 |
| Video | FFmpeg (RTSP/RTMP in → RTMP out), YouTube Live Streaming API, Facebook Live Video API |
| Push | Web Push with VAPID (`web-push` library) |
| Maps | Leaflet + OpenStreetMap |
| Bot | Telegram Bot API (grammY or node-telegram-bot-api) |
| Hosting | Web app on Vercel; controller on temple hardware (systemd service) |
| Scheduler for web tasks | External cron (Supabase scheduled functions, GitHub Actions, or cron-job.org) calling a secured endpoint, because Vercel free plan cron is limited |

Monorepo layout:

```
/apps/web              → Next.js app (public site + admin + APIs)
/apps/stream-controller→ Node service for the temple PC
/packages/shared       → shared types, schedule engine, validators
/data                  → seed JSON (temples, festivals, mandir info)
/docs                  → README, hardware guide, deployment guide
```

---

## 3. System Architecture

```
[IP Camera] --RTSP--> [Mini PC at temple]
                         |  FFmpeg (24x7, systemd)
                         |--RTMP--> YouTube ingest (persistent liveStream)
                         |--RTMP--> Facebook ingest
                         |
                  [stream-controller] --heartbeat/status--> [Web app API]
                         |                                        |
                         | reads schedule                         | serves site, admin, /api/live-status
                         v                                        v
       YouTube API: create/transition broadcasts      [PWA users] <-- Web Push
       Facebook API: create/end live videos           [Telegram bot] <-> admin commands
```

Principles:

- **FFmpeg never stops** between darshans (unless `ALWAYS_ON=false`). Only the *public visibility* changes.
- The **schedule engine** (shared package) is the single source of truth. Everything else (site, broadcasts, notifications) is derived from it.
- Every schedule change must **propagate automatically** everywhere.

---

## 4. Public Website – Pages & Features

### 4.1 Home / Live Darshan (`/`)
- Large live player (YouTube embed of the *current broadcast ID* from `/api/live-status`).
- **Live state:** show player with "LIVE" badge and current aarti name.
- **Not live:** show "पट बंद हैं" message, **countdown to next darshan**, and the latest recorded darshan.
- Buttons: Watch on YouTube, Watch on Facebook, Share on WhatsApp.
- "Today" card: today's date, Hindu tithi/paksha, festival (if any), today's darshan timings, any closure notice.
- "Upcoming utsav" strip (next 3 festivals).
- Announcement banner (from admin).
- Picture-in-picture / sticky mini-player when the user scrolls or navigates.

### 4.2 Darshan Timings (`/timings`)
- Summer and winter schedules (editable), aarti names: Mangla, Shringar, Rajbhog, Utthapan, Sandhya, Shayan (all editable).
- Auto-highlight **current** and **next** aarti (IST).
- Show date-specific overrides and closures prominently.
- "Last updated" label.

### 4.3 Tithi & Utsav Calendar (`/utsav`)
- Monthly calendar with Hindu tithi per day; highlight Ekadashi, Purnima, Amavasya, festivals.
- Festival list with description and mandir-specific programme: Janmashtami, Annakut, Holi/Fagotsav, Ram Navami, Deepawali, Basant Panchami, etc. (seed data, marked *verify*).
- Tithi source: use a free Panchang library or API with a **local JSON fallback**; cache results.

### 4.4 About the Mandir (`/mandir`)
- History, significance, architecture, seva/prasad information, dress code and rules, how to reach (map, nearest railway station, bus, distance from Kota), contact number, donation/seva details.
- All facts must come from committee-provided content or verified sources; flag uncertain items.

### 4.5 Jhalrapatan Temples Guide (`/temples`, `/temples/[slug]`)
- Directory of notable temples of Jhalrapatan. Each entry: name (Hindi/English), deity, history, timings, photo, Google Maps link, distance from Dwarkadhish Mandir, `verify` flag.
- Start with at least: Dwarkadhish Mandir, Surya (Padmanabh) Mandir, Shitaleshwar Mahadev Mandir (Chandrabhaga), Shantinath Jain Mandir, and other local temples and ghats. **Research using reliable sources and mark anything unconfirmed with `"verify": true`.** Do not invent facts.
- Search box, filter by deity/type, interactive map with pins, and a suggested one-day "Temple Trail" route.

### 4.6 Extras
- Photo gallery, WhatsApp channel link, SEO metadata, Open Graph tags, sitemap, Hindi/English toggle.

---

## 5. Schedule Engine (shared package)

### 5.1 Data model

```ts
Schedule {
  id, season: "summer" | "winter", validFrom, validTo
  slots: Slot[]
}
Slot {
  id, name_hi, name_en,
  start: "HH:mm", end: "HH:mm",
  enabled: boolean,
  startOffsetMin: number   // go public N minutes early
}
Override {
  id, date: "YYYY-MM-DD",
  type: "modify" | "add" | "remove" | "closed",
  slot?: Slot, slotId?: string,
  message_hi?, message_en?,
  createdBy, createdAt
}
Closure {
  id, from, to, message_hi, message_en, notifySubscribers: boolean
}
```

### 5.2 Rules
- Timezone is **Asia/Kolkata** everywhere. Never rely on the browser or server timezone.
- Resolution order for a given date: `closure` > `override` > regular season schedule.
- Function `getEffectiveSlots(date)` returns final slots; unit-test it thoroughly (season changes, overlapping slots, midnight edge cases).
- `getLiveState(now)` returns: `isLive`, `currentSlot`, `nextSlot`, `startsAt`, `closureMessage`.

---

## 6. Live Streaming (Always-On Ingest, Scheduled Visibility)

### 6.1 Stream controller (`/apps/stream-controller`)
- Runs as a **systemd service** on the temple PC; auto-restarts on crash or reboot.
- Starts **FFmpeg** with the camera RTSP/RTMP input (env) and outputs to **YouTube** and **Facebook** RTMP ingest.
- Recommended encode: 720p or 1080p, ~2.5–3 Mbps, keyframe interval 2s, AAC audio; make bitrate configurable.
- Reconnect with exponential backoff if camera or network drops. Log all events.
- Sends a **heartbeat** every 30 seconds to `/api/stream/heartbeat` (ingest connected, bitrate, uptime).
- `ALWAYS_ON` env flag:
  - `true` (default): FFmpeg runs 24x7.
  - `false`: FFmpeg starts a few minutes before each slot and stops after (bandwidth-saving mode).

### 6.2 YouTube
- Keep **one persistent `liveStream`** (auto-start and auto-stop disabled).
- For each slot, create a **scheduled `liveBroadcast`**, bind it to the persistent stream, transition to `live` at start and `complete` at end. Store broadcast IDs and titles (e.g., "श्री द्वारकाधीश मंदिर, झालरापाटन – सन्ध्या आरती – 12 Oct 2026").
- Set privacy to public, disable DVR if not needed, enable recording so past darshans are available.
- Handle OAuth (refresh token in env/secret store), quota limits, and API errors with retry.

### 6.3 Facebook
- Use the **Live Video API** with a Page access token: create a live video at slot start, end it at slot end.
- Handle token expiry and permission errors; alert admin when auth needs renewal. Check the current Meta developer docs and required permissions before implementing.

### 6.4 Web integration
- `GET /api/live-status` returns:

```json
{
  "isLive": true,
  "currentAarti": { "name_hi": "सन्ध्या आरती", "name_en": "Sandhya Aarti", "endsAt": "..." },
  "nextAarti": { "name_hi": "...", "startsAt": "..." },
  "youtubeVideoId": "abc123",
  "facebookVideoUrl": "https://...",
  "closureMessage": null,
  "streamHealthy": true
}
```
- Front-end polls every 30s (or uses Server-Sent Events) and switches player state automatically.
- Player is shown **only during live slots**; otherwise the closure/next-aarti view.

### 6.5 Failure handling
- If ingest is down when a slot begins, keep the broadcast scheduled, show "Stream shuru hone wali hai" on the site, and alert admin (Telegram + admin panel).
- If a YouTube/Facebook API call fails, retry with backoff; never block the other platform.

---

## 7. Schedule Changes & Cancellations (Admin)

### 7.1 Admin panel (`/admin`)
Mobile-friendly, simple Hindi UI, protected by password + optional OTP. Features:

1. **Regular schedule editor:** edit summer/winter slots (name, start, end, on/off).
2. **Date-specific overrides:** for a chosen date, change a slot's time, add an extra slot, or remove a slot. Allow entering festival dates in advance.
3. **"Darshan band hain" toggle:** for today or a date range, with a custom Hindi/English message shown on the site.
4. **Manual controls:** "Abhi live karo" (go live now) and "Live band karo" (end now).
5. **Stream health:** ingest connected, last heartbeat, current bitrate, next scheduled broadcast.
6. **Announcements:** banner text with start/end dates.
7. **Audit log:** who changed what and when.

### 7.2 Automatic propagation (must-have)
Any change must:
- Recompute the effective schedule.
- Delete/reschedule pending **YouTube broadcasts** and **Facebook live videos**.
- Cancel or reschedule pending **push notifications**.
- Update `/api/live-status` immediately.
- If darshan is cancelled while live: **end the stream on both platforms immediately** and show the closure message.
- Optionally send a push: "आज दर्शन स्थगित हैं" / "आज सन्ध्या आरती 7:00 बजे होगी".
- Update the "last updated" label on the public timing page.

### 7.3 Telegram bot (for the pujari / committee)
Restricted to whitelisted Telegram user IDs.

| Command | Action |
|---|---|
| `/status` | Current live state, next slot, stream health |
| `/band [message]` | Cancel today's darshan and show message |
| `/shuru` | Go live now |
| `/roko` | End live now |
| `/samay <aarti> <HH:MM>` | Change today's time for an aarti |
| `/kal` | Show tomorrow's schedule |

Bot replies in Hindi and confirms every action. Also sends alerts (stream down, API auth expired).

---

## 8. PWA & Push Notifications

- Full PWA: web manifest, icons (192/512 + maskable), service worker, offline fallback page, custom **install prompt** button.
- **Web Push (VAPID):** friendly opt-in ("दर्शन की सूचना पाएं"). Store subscriptions in the DB; remove invalid ones on 404/410.
- Notification types:
  - 10 minutes before each darshan.
  - When the stream goes live.
  - Festival/tithi reminders (e.g., day before Ekadashi/Janmashtami).
  - Schedule changes and closures.
- Users can choose which aarti notifications they want.
- **iOS note:** push works only after "Add to Home Screen" (iOS 16.4+). Show a short Hindi instruction before requesting permission.
- Notification scheduling via an external scheduler hitting a secured endpoint (`Authorization: Bearer <CRON_SECRET>`).
- Notification click opens the live page.

---

## 9. Design & UX

- **Feel:** devotional but modern. Deep indigo / night-blue background with gold accents (Krishna theme), subtle temple-inspired motifs (arch, lamp/diya), no clutter. Avoid generic SaaS-card look.
- **Typography:** Devanagari-friendly serif for headings (e.g., Tiro Devanagari Hindi or Noto Serif Devanagari) + clean sans for body. Large, readable Hindi text.
- **Mobile-first (360px baseline):** bottom navigation bar (Live, Timings, Utsav, Mandir, Temples), large tap targets, sticky mini-player, no horizontal scroll.
- **Performance:** lazy-load images, small JS bundle, works on 3G/4G and low-end Android. Lighthouse Performance ≥ 85, PWA and Accessibility ≥ 90.
- **Accessibility:** keyboard focus states, alt text, sufficient contrast, `prefers-reduced-motion` respected, light and dark theme support.
- **Motion:** minimal; one subtle moment (e.g., a diya glow when live starts). No decorative animations everywhere.

---

## 10. Content & Data Files (seed data)

Create editable JSON in `/data`:

- `mandir.json` – history, significance, rules, contact, how to reach.
- `schedule.json` – default summer/winter slots (placeholders: Mangla 5:30, Shringar 7:00, Rajbhog 11:30, Sandhya 18:30, Shayan 21:00 – **committee must confirm**).
- `festivals.json` – festival list with descriptions.
- `temples.json` – Jhalrapatan temples with `verify` flags.

Every placeholder or unverified fact must carry `"verify": true` so the committee can confirm before launch.

---

## 11. Environment Variables

```
# Web app
DATABASE_URL=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
CRON_SECRET=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:...
TELEGRAM_BOT_TOKEN=
TELEGRAM_ALLOWED_USER_IDS=

# Stream controller
CAMERA_URL=rtsp://...
YOUTUBE_RTMP_URL=
YOUTUBE_STREAM_KEY=
FACEBOOK_RTMP_URL=
FACEBOOK_STREAM_KEY=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REFRESH_TOKEN=
FACEBOOK_PAGE_ID=
FACEBOOK_PAGE_ACCESS_TOKEN=
WEB_API_URL=
STREAM_CONTROLLER_TOKEN=
VIDEO_BITRATE_KBPS=2800
ALWAYS_ON=true
TZ=Asia/Kolkata
```

Never commit secrets. Provide `.env.example` files.

---

## 12. Security & Reliability

- Admin and API routes protected; rate-limit login; hash passwords (argon2/bcrypt); httpOnly secure cookies.
- Stream controller and cron endpoints authenticated with bearer tokens.
- Telegram bot restricted to whitelisted user IDs.
- Validate all inputs (zod). Sanitize admin-entered messages.
- Audit log for every schedule/stream change.
- Regular database backups; document restore steps.
- Do not expose stream keys to the browser.

---

## 13. Milestones

1. **Foundation:** monorepo, design system, Hindi/English i18n, PWA shell, seed data.
2. **Public pages:** home, timings, utsav, mandir, temples + map.
3. **Schedule engine:** shared package with tests, `/api/live-status`.
4. **Admin panel:** schedule editor, overrides, closures, audit log.
5. **Stream controller:** FFmpeg always-on service, heartbeat, reconnect logic.
6. **Platform automation:** YouTube broadcast scheduling, Facebook live automation, propagation on schedule changes.
7. **Push notifications:** VAPID, opt-in, scheduled and event-based notifications, iOS guidance.
8. **Telegram bot:** commands and alerts.
9. **Polish & QA:** accessibility, performance, SEO, mobile testing (360/390/768/1280px), error states.
10. **Docs & handover:** README, hardware guide, deployment guide.

---

## 14. Acceptance Criteria

- At a scheduled start time, the broadcast goes live on YouTube and Facebook and the website player appears, without manual action; at end time it ends everywhere.
- Changing a slot time in admin updates the website, pending broadcasts and notifications within one minute.
- "Darshan band hain" immediately ends any live stream and shows the message on the site.
- Push notification arrives ~10 minutes before darshan and at live start on an installed Android PWA (and on an installed iOS PWA).
- The site is fully usable at 360px width, with no horizontal scroll, and passes Lighthouse targets above.
- If the camera or internet drops, the controller reconnects automatically and the admin gets an alert.
- No secrets in the repo; `.env.example` provided; unverified facts flagged.

---

## 15. Deliverables

- Working code for web app, stream controller and shared package.
- **README** covering: setting up YouTube/Facebook API access and keys, generating VAPID keys, creating the Telegram bot, editing timings/festivals/temples, and deploying web app and controller.
- **Hardware guide:** camera requirements (RTSP/RTMP, night vision, audio), mini PC/Raspberry Pi specs, FFmpeg command, network (recommended 5–10 Mbps upload, check ISP data limits), UPS/power backup, systemd service file.
- **Bandwidth note:** 24x7 at ~3 Mbps ≈ 32 GB/day (~1 TB/month). Document `ALWAYS_ON=false` as a data-saving option.
- Seed data with all placeholders clearly flagged for committee confirmation.

---

## 16. Instructions to the Agent

1. Read this whole spec, then **produce a plan first**: pages, components, database schema, API routes, services, risks, and milestone order. Wait for approval.
2. Build one milestone at a time; after each, run the app and test in the browser, then summarize what works and what is pending.
3. Do not invent facts about temples, history or timings. Use reliable sources, flag uncertainty with `verify`.
4. Check current YouTube and Facebook API documentation before implementing; note any limitations or required app reviews.
5. Keep the code clean, typed, tested (schedule engine especially), and documented.
