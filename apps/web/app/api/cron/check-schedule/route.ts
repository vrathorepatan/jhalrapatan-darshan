import { NextRequest, NextResponse } from "next/server";
import { getLiveState, getEffectiveSlots } from "@jd/shared";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "jd-cron-secret";

    if (authHeader !== `Bearer ${cronSecret}`) {
      // Also allow if local call or admin session
      const cookie = req.cookies.get("jd_admin_session");
      if (cookie?.value !== "authenticated") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const now = new Date();
    const db = readDb();
    const liveState = getLiveState(now, db.schedules, db.overrides, db.closures);
    const slots = getEffectiveSlots(now, db.schedules, db.overrides, db.closures);

    const notificationsTriggered: string[] = [];

    // Check if next slot starts in ~10 minutes
    if (liveState.nextSlot?.startsAt) {
      const startsAt = new Date(liveState.nextSlot.startsAt).getTime();
      const diffMs = startsAt - now.getTime();
      const diffMins = Math.round(diffMs / 60000);

      if (diffMins >= 9 && diffMins <= 11) {
        notificationsTriggered.push(
          `Upcoming: ${liveState.nextSlot.name_hi} 10 मिनट में प्रारंभ होगी`
        );
      }
    }

    // Check if currently live
    if (liveState.isLive && liveState.currentSlot) {
      notificationsTriggered.push(
        `Live Now: ${liveState.currentSlot.name_hi} प्रारंभ हो चुकी है`
      );
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      liveState,
      effectiveSlotsCount: slots.length,
      notificationsTriggered,
    });
  } catch (error) {
    console.error("Cron check-schedule failed:", error);
    return NextResponse.json({ error: "Cron execution failed" }, { status: 500 });
  }
}
