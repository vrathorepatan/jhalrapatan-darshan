import { NextRequest, NextResponse } from "next/server";
import { setManualLiveState } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const streamToken = process.env.STREAM_CONTROLLER_TOKEN || "jd-secret-stream-token";
    const cronSecret = process.env.CRON_SECRET || "jd-cron-secret";

    const token = authHeader?.replace("Bearer ", "");
    const adminAuthCookie = req.cookies.get("jd_admin_session")?.value;

    if (token !== streamToken && token !== cronSecret && adminAuthCookie !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    setManualLiveState(false, "", token ? "bot/controller" : "admin");

    return NextResponse.json({
      success: true,
      message: "लाइव प्रसारण समाप्त किया गया",
    });
  } catch (error) {
    console.error("Error ending manual live:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
