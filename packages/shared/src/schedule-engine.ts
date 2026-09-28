import { toZonedTime, fromZonedTime, format } from "date-fns-tz";
import { addDays, parseISO } from "date-fns";
import type {
  Slot,
  Schedule,
  Override,
  Closure,
  LiveState,
  LiveSlotInfo,
  NextSlotInfo,
  Season,
} from "./types.js";

// ─── Constants ────────────────────────────────────────────────────────────────

export const IST = "Asia/Kolkata";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a Date to IST and return the "YYYY-MM-DD" string.
 */
export function toISTDate(date: Date): string {
  return format(toZonedTime(date, IST), "yyyy-MM-dd", { timeZone: IST });
}

/**
 * Given a "YYYY-MM-DD" date string and "HH:mm" time string (IST),
 * return a UTC Date object.
 */
export function istToUtc(date: string, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const zoned = toZonedTime(parseISO(date), IST);
  zoned.setHours(h, m, 0, 0);
  return fromZonedTime(zoned, IST);
}

/**
 * Parse "MM-DD" into { month, day } (1-indexed month).
 */
function parseMonthDay(md: string): { month: number; day: number } {
  const [m, d] = md.split("-").map(Number);
  return { month: m, day: d };
}

/**
 * Determine the current season for a given IST date.
 */
export function getSeason(
  date: Date,
  schedules: Schedule[]
): Schedule | undefined {
  const zoned = toZonedTime(date, IST);
  const month = zoned.getMonth() + 1; // 1-indexed
  const day = zoned.getDate();

  return schedules.find((s) => {
    const from = parseMonthDay(s.validFrom);
    const to = parseMonthDay(s.validTo);

    // Check if the season wraps across year boundary (e.g. Oct–Mar)
    const afterStart =
      month > from.month || (month === from.month && day >= from.day);
    const beforeEnd =
      month < to.month || (month === to.month && day <= to.day);

    if (from.month <= to.month) {
      // Same calendar year range (e.g. Apr–Sep)
      return afterStart && beforeEnd;
    } else {
      // Wraps year boundary (e.g. Oct–Mar)
      return afterStart || beforeEnd;
    }
  });
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Get the effective slots for a given date, applying:
 *   closure > override > regular season schedule
 *
 * @param date  UTC Date (or IST Date) – will be converted to IST internally
 * @param schedules  All season schedules
 * @param overrides  All overrides
 * @param closures  All closures
 * @returns  Array of effective Slot objects for that date (may be empty for closed days)
 */
export function getEffectiveSlots(
  date: Date,
  schedules: Schedule[],
  overrides: Override[],
  closures: Closure[]
): Slot[] {
  const istDate = toISTDate(date);

  // 1. Check for active closure covering this date
  const closure = closures.find((c) => {
    return istDate >= c.from.slice(0, 10) && istDate <= c.to.slice(0, 10);
  });
  if (closure) return []; // No darshan during closure

  // 2. Start with the regular season schedule
  const schedule = getSeason(date, schedules);
  let slots: Slot[] = schedule
    ? schedule.slots.filter((s) => s.enabled).map((s) => ({ ...s }))
    : [];

  // 3. Check for a "closed" override (entire day closed, no season closure)
  const closedOverride = overrides.find(
    (o) => o.date === istDate && o.type === "closed"
  );
  if (closedOverride) return []; // Closed today via override

  // 4. Apply modify / add / remove overrides for this date
  const dayOverrides = overrides.filter(
    (o) => o.date === istDate && o.type !== "closed"
  );

  for (const override of dayOverrides) {
    switch (override.type) {
      case "remove":
        slots = slots.filter((s) => s.id !== override.slotId);
        break;
      case "modify":
        if (override.slotId && override.slot) {
          slots = slots.map((s) =>
            s.id === override.slotId ? { ...s, ...override.slot } : s
          );
        }
        break;
      case "add":
        if (override.slot) {
          slots.push({ ...override.slot });
        }
        break;
    }
  }

  // Sort by start time
  return slots.sort((a, b) => a.start.localeCompare(b.start));
}

/**
 * Determine the live state at a given UTC moment.
 *
 * @param now  Current UTC Date
 * @param schedules  All season schedules
 * @param overrides  All overrides
 * @param closures  All closures
 */
export function getLiveState(
  now: Date,
  schedules: Schedule[],
  overrides: Override[],
  closures: Closure[]
): LiveState {
  const istDateStr = toISTDate(now);

  // Check active closure
  const activeClosure = closures.find((c) => {
    const from = new Date(c.from);
    const to = new Date(c.to);
    return now >= from && now <= to;
  });

  if (activeClosure) {
    return {
      isLive: false,
      currentSlot: null,
      nextSlot: null,
      closureMessage: activeClosure.message_hi,
    };
  }

  const slots = getEffectiveSlots(now, schedules, overrides, closures);

  // Build slot UTC times for today
  type SlotWithTimes = Slot & { startUtc: Date; endUtc: Date };
  const slotsWithTimes: SlotWithTimes[] = slots.map((s) => ({
    ...s,
    startUtc: istToUtc(istDateStr, s.start),
    endUtc: istToUtc(istDateStr, s.end),
  }));

  // Find currently live slot
  const currentSlot = slotsWithTimes.find(
    (s) => now >= s.startUtc && now < s.endUtc
  );

  if (currentSlot) {
    // Look for next slot today
    const nextSlotToday = slotsWithTimes.find(
      (s) => s.startUtc > currentSlot.endUtc
    );

    let nextSlotInfo: NextSlotInfo | null = null;
    if (nextSlotToday) {
      nextSlotInfo = {
        id: nextSlotToday.id,
        name_hi: nextSlotToday.name_hi,
        name_en: nextSlotToday.name_en,
        startsAt: nextSlotToday.startUtc.toISOString(),
      };
    } else {
      // Look for first slot tomorrow
      const tomorrow = addDays(now, 1);
      const tomorrowSlots = getEffectiveSlots(
        tomorrow,
        schedules,
        overrides,
        closures
      );
      if (tomorrowSlots.length > 0) {
        const tmrDateStr = toISTDate(tomorrow);
        const firstTmr = tomorrowSlots[0];
        nextSlotInfo = {
          id: firstTmr.id,
          name_hi: firstTmr.name_hi,
          name_en: firstTmr.name_en,
          startsAt: istToUtc(tmrDateStr, firstTmr.start).toISOString(),
        };
      }
    }

    const liveSlotInfo: LiveSlotInfo = {
      id: currentSlot.id,
      name_hi: currentSlot.name_hi,
      name_en: currentSlot.name_en,
      endsAt: currentSlot.endUtc.toISOString(),
    };

    return {
      isLive: true,
      currentSlot: liveSlotInfo,
      nextSlot: nextSlotInfo,
      closureMessage: null,
    };
  }

  // Not live – find next upcoming slot
  const upcomingToday = slotsWithTimes.find((s) => s.startUtc > now);

  if (upcomingToday) {
    return {
      isLive: false,
      currentSlot: null,
      nextSlot: {
        id: upcomingToday.id,
        name_hi: upcomingToday.name_hi,
        name_en: upcomingToday.name_en,
        startsAt: upcomingToday.startUtc.toISOString(),
      },
      closureMessage: null,
    };
  }

  // No more slots today – check tomorrow
  const tomorrow = addDays(now, 1);
  const tomorrowSlots = getEffectiveSlots(
    tomorrow,
    schedules,
    overrides,
    closures
  );

  if (tomorrowSlots.length > 0) {
    const tmrDateStr = toISTDate(tomorrow);
    const firstTmr = tomorrowSlots[0];
    return {
      isLive: false,
      currentSlot: null,
      nextSlot: {
        id: firstTmr.id,
        name_hi: firstTmr.name_hi,
        name_en: firstTmr.name_en,
        startsAt: istToUtc(tmrDateStr, firstTmr.start).toISOString(),
      },
      closureMessage: null,
    };
  }

  // No upcoming slots found
  return {
    isLive: false,
    currentSlot: null,
    nextSlot: null,
    closureMessage: null,
  };
}
