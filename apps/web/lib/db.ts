import fs from "fs";
import path from "path";
import scheduleData from "../../../data/schedule.json";
import type { Schedule, Slot, Override, Closure } from "@jd/shared";

export interface Announcement {
  id: string;
  message_hi: string;
  message_en: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
}

export interface StreamHeartbeat {
  ingestConnected: boolean;
  bitrate: number;
  uptime: number;
  receivedAt: string;
  isManualLive?: boolean;
  manualLiveSlotName?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  actor: string;
  createdAt: string;
}

export interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  aartis?: string[];
  createdAt: string;
}

export interface DatabaseStore {
  schedules: Schedule[];
  overrides: Override[];
  closures: Closure[];
  announcements: Announcement[];
  heartbeat: StreamHeartbeat;
  auditLogs: AuditLogEntry[];
  pushSubscriptions: PushSubscriptionRecord[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), "../../data/db-store.json");
const ALT_DB_FILE_PATH = path.resolve(process.cwd(), "data/db-store.json");

function getStoragePath(): string {
  // If cwd is apps/web, DB is in ../../data/db-store.json
  const dir1 = path.dirname(DB_FILE_PATH);
  if (fs.existsSync(dir1)) return DB_FILE_PATH;
  const dir2 = path.dirname(ALT_DB_FILE_PATH);
  if (fs.existsSync(dir2)) return ALT_DB_FILE_PATH;
  return path.resolve(process.cwd(), "db-store.json");
}

function getDefaultStore(): DatabaseStore {
  return {
    schedules: (scheduleData.seasons || []) as unknown as Schedule[],
    overrides: [],
    closures: [],
    announcements: [
      {
        id: "default-announcement-1",
        message_hi: "श्री द्वारकाधीश मंदिर में आपका स्वागत है। दर्शन आरती अनुसार प्रसारित किए जाते हैं।",
        message_en: "Welcome to Shri Dwarkadhish Mandir. Darshan is streamed during Aarti hours.",
        startsAt: new Date(Date.now() - 86400000).toISOString(),
        endsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        active: true,
      },
    ],
    heartbeat: {
      ingestConnected: true,
      bitrate: 2850,
      uptime: 3600,
      receivedAt: new Date().toISOString(),
      isManualLive: false,
    },
    auditLogs: [
      {
        id: "init-1",
        action: "INITIALIZE",
        entity: "SYSTEM",
        details: "Database store initialized with default schedules.",
        actor: "system",
        createdAt: new Date().toISOString(),
      },
    ],
    pushSubscriptions: [],
  };
}

export function readDb(): DatabaseStore {
  const filePath = getStoragePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as DatabaseStore;
    }
  } catch (err) {
    console.error("Error reading db file, falling back to default store:", err);
  }
  const defaultStore = getDefaultStore();
  writeDb(defaultStore);
  return defaultStore;
}

export function writeDb(data: DatabaseStore): void {
  const filePath = getStoragePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing db file:", err);
  }
}

// Helper methods for admin and live state
export function getSchedules(): Schedule[] {
  return readDb().schedules;
}

export function updateSchedules(schedules: Schedule[], actor = "admin"): void {
  const db = readDb();
  db.schedules = schedules;
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: "UPDATE_SCHEDULE",
    entity: "schedules",
    details: "Updated season schedule and slots",
    actor,
    createdAt: new Date().toISOString(),
  });
  writeDb(db);
}

export function getOverrides(): Override[] {
  return readDb().overrides;
}

export function addOverride(override: Omit<Override, "id" | "createdAt">, actor = "admin"): Override {
  const db = readDb();
  const newOverride: Override = {
    ...override,
    id: `ov-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.overrides.push(newOverride);
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: "ADD_OVERRIDE",
    entity: "overrides",
    entityId: newOverride.id,
    details: `Added override for ${override.date} (${override.type})`,
    actor,
    createdAt: new Date().toISOString(),
  });
  writeDb(db);
  return newOverride;
}

export function deleteOverride(id: string, actor = "admin"): boolean {
  const db = readDb();
  const initialLen = db.overrides.length;
  db.overrides = db.overrides.filter((o) => o.id !== id);
  if (db.overrides.length !== initialLen) {
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: "DELETE_OVERRIDE",
      entity: "overrides",
      entityId: id,
      details: `Removed override ${id}`,
      actor,
      createdAt: new Date().toISOString(),
    });
    writeDb(db);
    return true;
  }
  return false;
}

export function getClosures(): Closure[] {
  return readDb().closures;
}

export function addClosure(closure: Omit<Closure, "id">, actor = "admin"): Closure {
  const db = readDb();
  const newClosure: Closure = {
    ...closure,
    id: `cl-${Date.now()}`,
  };
  db.closures.push(newClosure);
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: "ADD_CLOSURE",
    entity: "closures",
    entityId: newClosure.id,
    details: `Added temple closure: ${closure.from} to ${closure.to}`,
    actor,
    createdAt: new Date().toISOString(),
  });
  writeDb(db);
  return newClosure;
}

export function deleteClosure(id: string, actor = "admin"): boolean {
  const db = readDb();
  const initialLen = db.closures.length;
  db.closures = db.closures.filter((c) => c.id !== id);
  if (db.closures.length !== initialLen) {
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: "DELETE_CLOSURE",
      entity: "closures",
      entityId: id,
      details: `Removed closure ${id}`,
      actor,
      createdAt: new Date().toISOString(),
    });
    writeDb(db);
    return true;
  }
  return false;
}

export function getAnnouncements(): Announcement[] {
  return readDb().announcements;
}

export function saveAnnouncement(announcement: Announcement, actor = "admin"): void {
  const db = readDb();
  const idx = db.announcements.findIndex((a) => a.id === announcement.id);
  if (idx >= 0) {
    db.announcements[idx] = announcement;
  } else {
    db.announcements.unshift(announcement);
  }
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: "SAVE_ANNOUNCEMENT",
    entity: "announcements",
    entityId: announcement.id,
    details: `Saved announcement: ${announcement.message_hi.slice(0, 30)}...`,
    actor,
    createdAt: new Date().toISOString(),
  });
  writeDb(db);
}

export function getStreamHeartbeat(): StreamHeartbeat {
  return readDb().heartbeat;
}

export function updateStreamHeartbeat(heartbeat: Partial<StreamHeartbeat>): StreamHeartbeat {
  const db = readDb();
  db.heartbeat = {
    ...db.heartbeat,
    ...heartbeat,
    receivedAt: new Date().toISOString(),
  };
  writeDb(db);
  return db.heartbeat;
}

export function setManualLiveState(isLive: boolean, slotName = "विशेष दर्शन", actor = "admin"): void {
  const db = readDb();
  db.heartbeat.isManualLive = isLive;
  db.heartbeat.manualLiveSlotName = isLive ? slotName : undefined;
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: isLive ? "MANUAL_GO_LIVE" : "MANUAL_END_LIVE",
    entity: "stream",
    details: isLive ? `Manual live started: ${slotName}` : "Manual live ended",
    actor,
    createdAt: new Date().toISOString(),
  });
  writeDb(db);
}

export function getAuditLogs(): AuditLogEntry[] {
  return readDb().auditLogs;
}

export function getPushSubscriptions(): PushSubscriptionRecord[] {
  return readDb().pushSubscriptions;
}

export function addPushSubscription(sub: Omit<PushSubscriptionRecord, "id" | "createdAt">): PushSubscriptionRecord {
  const db = readDb();
  const existing = db.pushSubscriptions.find((s) => s.endpoint === sub.endpoint);
  if (existing) {
    existing.keys = sub.keys;
    existing.aartis = sub.aartis;
    writeDb(db);
    return existing;
  }
  const newSub: PushSubscriptionRecord = {
    ...sub,
    id: `sub-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.pushSubscriptions.push(newSub);
  writeDb(db);
  return newSub;
}

export function removePushSubscription(endpoint: string): boolean {
  const db = readDb();
  const initialLen = db.pushSubscriptions.length;
  db.pushSubscriptions = db.pushSubscriptions.filter((s) => s.endpoint !== endpoint);
  if (db.pushSubscriptions.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}
