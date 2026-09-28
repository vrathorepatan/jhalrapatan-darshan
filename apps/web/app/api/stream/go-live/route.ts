import { NextRequest, NextResponse } from "next/server";
import { setManualLiveState } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const streamToken = process.env.STREAM_CONTROLLER_TOKEN || "jd-secret-stream-token";
    const cronSecret = process.env.CRON_SECRET || "jd-cron-secret";

    // Allow call if bearer matches stream token or cron secret or admin session cookie
    const token = authHeader?.replace("Bearer ", "");
    const adminAuthCookie = req.cookies.get("jd_admin_session")?.value;

    if (token !== streamToken && token !== cronSecret && adminAuthCookie !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let slotName = "विशेष दर्शन (लाइव)";
    try {
      const body = await req.json();
      if (body.slotName) slotName = body.slotName;
    } catch {
      // Body may be empty
    }

    setManualLiveState(true, slotName, token ? "bot/controller" : "admin");

    return NextResponse.json({
      success: true,
      message: `लाइव प्रसारण प्रारंभ किया गया (${slotName})`,
    });
  } catch (error) {
    console.error("Error starting manual live:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
