import { NextResponse } from "next/server";
import { getEffectiveSlots } from "@jd/shared";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = readDb();
    const now = new Date();
    const effectiveToday = getEffectiveSlots(now, db.schedules, db.overrides, db.closures);

    return NextResponse.json({
      success: true,
      today: effectiveToday,
      seasons: db.schedules,
      overrides: db.overrides,
      closures: db.closures,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error reading schedule:", error);
    return NextResponse.json({ success: false, error: "Failed to read schedule" }, { status: 500 });
  }
}
