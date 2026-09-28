// ─── Core Data Types ──────────────────────────────────────────────────────────

export type Season = "summer" | "winter";

export interface Slot {
  id: string;
  name_hi: string;
  name_en: string;
  /** 24-hour "HH:mm" in IST */
  start: string;
  /** 24-hour "HH:mm" in IST */
  end: string;
  enabled: boolean;
  /** Go public N minutes before start (for pre-live setup) */
  startOffsetMin: number;
}

export interface Schedule {
  id: string;
  season: Season;
  /** "MM-DD" format for season boundaries */
  validFrom: string;
  validTo: string;
  slots: Slot[];
}

export type OverrideType = "modify" | "add" | "remove" | "closed";

export interface Override {
  id: string;
  /** "YYYY-MM-DD" in IST */
  date: string;
  type: OverrideType;
  slotId?: string;
  slot?: Slot;
  message_hi?: string;
  message_en?: string;
  createdBy: string;
  createdAt: string;
}

export interface Closure {
  id: string;
  /** ISO datetime strings in IST */
  from: string;
  to: string;
  message_hi: string;
  message_en: string;
  notifySubscribers: boolean;
}

// ─── Live State ───────────────────────────────────────────────────────────────

export interface LiveSlotInfo {
  id: string;
  name_hi: string;
  name_en: string;
  /** ISO datetime string */
  endsAt: string;
}

export interface NextSlotInfo {
  id: string;
  name_hi: string;
  name_en: string;
  /** ISO datetime string */
  startsAt: string;
}

export interface LiveState {
  isLive: boolean;
  currentSlot: LiveSlotInfo | null;
  nextSlot: NextSlotInfo | null;
  closureMessage: string | null;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface LiveStatusResponse {
  isLive: boolean;
  currentAarti: LiveSlotInfo | null;
  nextAarti: NextSlotInfo | null;
  youtubeVideoId: string | null;
  facebookVideoUrl: string | null;
  closureMessage: string | null;
  streamHealthy: boolean;
}

// ─── Push Notification ───────────────────────────────────────────────────────

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  /** Slot IDs the user wants notifications for, or "all" */
  aarti: string[] | "all";
}

// ─── Temple & Content Types ──────────────────────────────────────────────────

export interface Temple {
  slug: string;
  name_hi: string;
  name_en: string;
  deity_hi: string | null;
  deity_en: string | null;
  type: string;
  description_hi: string;
  description_en: string;
  timings_hi: string;
  history_hi: string;
  coordinates: { lat: number; lng: number; verify?: boolean };
  distance_from_main_km: number;
  google_maps_url: string;
  photo: string | null;
  verify: boolean;
}

export interface Festival {
  id: string;
  name_hi: string;
  name_en: string;
  tithi: string;
  month_approx: number | null;
  description_hi: string;
  description_en: string;
  mandir_programme_hi: string;
  verify: boolean;
}

// ─── Admin Types ─────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  before: unknown;
  after: unknown;
  actor: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  message_hi: string;
  message_en: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
}

// ─── Stream Health ────────────────────────────────────────────────────────────

export interface StreamHeartbeat {
  ingestConnected: boolean;
  bitrateKbps: number;
  uptimeSeconds: number;
  receivedAt: string;
}
