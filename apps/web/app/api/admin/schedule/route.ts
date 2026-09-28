import { NextRequest, NextResponse } from "next/server";
import { getSchedules, updateSchedules } from "@/lib/db";

export const dynamic = "force-dynamic";

function checkAuth(req: NextRequest) {
  const cookie = req.cookies.get("jd_admin_session");
  return cookie?.value === "authenticated";
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ success: true, schedules: getSchedules() });
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { schedules } = await req.json();
    if (!Array.isArray(schedules)) {
      return NextResponse.json({ error: "Invalid schedules format" }, { status: 400 });
    }
    updateSchedules(schedules, "admin");
    return NextResponse.json({ success: true, message: "Schedule updated successfully" });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}
