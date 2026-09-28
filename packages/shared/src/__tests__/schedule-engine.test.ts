import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getEffectiveSlots, getLiveState } from "../schedule-engine.js";
import type { Schedule, Override, Closure } from "../types.js";

// ─── Test Fixtures ─────────────────────────────────────────────────────────

const summerSchedule: Schedule = {
  id: "summer-2026",
  season: "summer",
  validFrom: "04-01",
  validTo: "09-30",
  slots: [
    {
      id: "mangla",
      name_hi: "मंगला",
      name_en: "Mangla",
      start: "05:30",
      end: "06:00",
      enabled: true,
      startOffsetMin: 5,
    },
    {
      id: "rajbhog",
      name_hi: "राजभोग",
      name_en: "Rajbhog",
      start: "11:30",
      end: "12:15",
      enabled: true,
      startOffsetMin: 5,
    },
    {
      id: "sandhya",
      name_hi: "सन्ध्या",
      name_en: "Sandhya",
      start: "18:30",
      end: "19:15",
      enabled: true,
      startOffsetMin: 5,
    },
    {
      id: "shayan",
      name_hi: "शयन",
      name_en: "Shayan",
      start: "21:00",
      end: "21:30",
      enabled: true,
      startOffsetMin: 5,
    },
  ],
};

const winterSchedule: Schedule = {
  id: "winter-2026",
  season: "winter",
  validFrom: "10-01",
  validTo: "03-31",
  slots: [
    {
      id: "mangla",
      name_hi: "मंगला",
      name_en: "Mangla",
      start: "06:00",
      end: "06:30",
      enabled: true,
      startOffsetMin: 5,
    },
    {
      id: "sandhya",
      name_hi: "सन्ध्या",
      name_en: "Sandhya",
      start: "18:00",
      end: "18:45",
      enabled: true,
      startOffsetMin: 5,
    },
    {
      id: "shayan",
      name_hi: "शयन",
      name_en: "Shayan",
      start: "20:30",
      end: "21:00",
      enabled: true,
      startOffsetMin: 5,
    },
  ],
};

const schedules = [summerSchedule, winterSchedule];
const noOverrides: Override[] = [];
const noClosures: Closure[] = [];

// Helper: create a UTC Date for a given IST datetime
function ist(dateStr: string, timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00+05:30`);
  d.setHours(d.getHours() + h, d.getMinutes() + m);
  return d;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getEffectiveSlots", () => {
  it("returns summer slots in summer", () => {
    const date = new Date("2026-07-15T12:00:00Z"); // July = summer IST
    const slots = getEffectiveSlots(date, schedules, noOverrides, noClosures);
    assert.equal(slots.length, 4);
    assert.equal(slots[0].id, "mangla");
    assert.equal(slots[0].start, "05:30");
  });

  it("returns winter slots in winter", () => {
    const date = new Date("2026-12-25T12:00:00Z"); // December = winter IST
    const slots = getEffectiveSlots(date, schedules, noOverrides, noClosures);
    assert.equal(slots.length, 3);
    assert.equal(slots[0].id, "mangla");
    assert.equal(slots[0].start, "06:00");
  });

  it("returns empty slots on closure", () => {
    const closure: Closure = {
      id: "c1",
      from: "2026-07-15T00:00:00+05:30",
      to: "2026-07-15T23:59:59+05:30",
      message_hi: "आज बंद",
      message_en: "Closed today",
      notifySubscribers: true,
    };
    const date = new Date("2026-07-15T12:00:00Z");
    const slots = getEffectiveSlots(date, schedules, noOverrides, [closure]);
    assert.equal(slots.length, 0);
  });

  it("removes slot on remove override", () => {
    const override: Override = {
      id: "o1",
      date: "2026-07-15",
      type: "remove",
      slotId: "rajbhog",
      createdBy: "admin",
      createdAt: "2026-07-14T10:00:00Z",
    };
    const date = new Date("2026-07-15T12:00:00Z");
    const slots = getEffectiveSlots(date, schedules, [override], noClosures);
    assert.equal(
      slots.find((s) => s.id === "rajbhog"),
      undefined
    );
    assert.equal(slots.length, 3);
  });

  it("modifies slot time on modify override", () => {
    const override: Override = {
      id: "o2",
      date: "2026-07-15",
      type: "modify",
      slotId: "sandhya",
      slot: {
        id: "sandhya",
        name_hi: "सन्ध्या",
        name_en: "Sandhya",
        start: "19:00",
        end: "19:45",
        enabled: true,
        startOffsetMin: 5,
      },
      createdBy: "admin",
      createdAt: "2026-07-14T10:00:00Z",
    };
    const date = new Date("2026-07-15T12:00:00Z");
    const slots = getEffectiveSlots(date, schedules, [override], noClosures);
    const sandhya = slots.find((s) => s.id === "sandhya");
    assert.equal(sandhya?.start, "19:00");
  });

  it("adds extra slot on add override", () => {
    const override: Override = {
      id: "o3",
      date: "2026-07-15",
      type: "add",
      slot: {
        id: "special",
        name_hi: "विशेष आरती",
        name_en: "Special Aarti",
        start: "08:00",
        end: "08:30",
        enabled: true,
        startOffsetMin: 5,
      },
      createdBy: "admin",
      createdAt: "2026-07-14T10:00:00Z",
    };
    const date = new Date("2026-07-15T12:00:00Z");
    const slots = getEffectiveSlots(date, schedules, [override], noClosures);
    assert.ok(slots.find((s) => s.id === "special"));
    assert.equal(slots.length, 5);
  });

  it("returns empty on closed override", () => {
    const override: Override = {
      id: "o4",
      date: "2026-07-15",
      type: "closed",
      message_hi: "आज दर्शन बंद हैं",
      createdBy: "admin",
      createdAt: "2026-07-14T10:00:00Z",
    };
    const date = new Date("2026-07-15T12:00:00Z");
    const slots = getEffectiveSlots(date, schedules, [override], noClosures);
    assert.equal(slots.length, 0);
  });

  it("handles winter boundary correctly (Oct 1)", () => {
    const date = new Date("2026-09-30T20:00:00Z"); // Oct 1 in IST (UTC+5:30)
    const slots = getEffectiveSlots(date, schedules, noOverrides, noClosures);
    // Oct 1 IST = winter
    assert.equal(slots[0].start, "06:00"); // winter mangla
  });
});

describe("getLiveState", () => {
  it("detects currently live slot (Rajbhog)", () => {
    // 2026-07-15 at 12:00 IST = Rajbhog (11:30–12:15)
    const now = new Date("2026-07-15T06:32:00Z"); // 12:02 IST
    const state = getLiveState(now, schedules, noOverrides, noClosures);
    assert.equal(state.isLive, true);
    assert.equal(state.currentSlot?.id, "rajbhog");
    assert.ok(state.nextSlot?.id === "sandhya");
  });

  it("returns isLive false between slots", () => {
    // 2026-07-15 at 09:00 IST – between Mangla (ends 06:00) and Rajbhog (starts 11:30)
    const now = new Date("2026-07-15T03:30:00Z"); // 09:00 IST
    const state = getLiveState(now, schedules, noOverrides, noClosures);
    assert.equal(state.isLive, false);
    assert.equal(state.nextSlot?.id, "rajbhog");
  });

  it("returns closure message when closure active", () => {
    const closure: Closure = {
      id: "c1",
      from: "2026-07-15T00:00:00+05:30",
      to: "2026-07-15T23:59:59+05:30",
      message_hi: "मंदिर बंद है",
      message_en: "Temple closed",
      notifySubscribers: false,
    };
    const now = new Date("2026-07-15T06:32:00Z");
    const state = getLiveState(now, [summerSchedule], noOverrides, [closure]);
    assert.equal(state.isLive, false);
    assert.equal(state.closureMessage, "मंदिर बंद है");
  });

  it("finds tomorrow slot when no more slots today", () => {
    // 2026-07-15 at 22:00 IST – after Shayan (ends 21:30)
    const now = new Date("2026-07-15T16:31:00Z"); // 22:01 IST
    const state = getLiveState(now, schedules, noOverrides, noClosures);
    assert.equal(state.isLive, false);
    assert.ok(state.nextSlot); // Should find tomorrow's first slot
  });
});
