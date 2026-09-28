import { NextRequest, NextResponse } from "next/server";
import { getPushSubscriptions } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "jd-cron-secret";
    const adminAuthCookie = req.cookies.get("jd_admin_session")?.value;

    if (authHeader !== `Bearer ${cronSecret}` && adminAuthCookie !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body, aartiId, url } = await req.json();
    const subs = getPushSubscriptions();

    // Filter subscribers interested in this aarti
    const targetSubs = subs.filter((s) => {
      if (!aartiId) return true;
      if (!s.aartis || s.aartis.length === 0) return true;
      return s.aartis.includes("all") || s.aartis.includes(aartiId);
    });

    console.log(`[PUSH] Dispatching to ${targetSubs.length} subscribers: "${title}" - ${body}`);

    // In production with VAPID keys, web-push sends payload
    // webpush.sendNotification(...)

    return NextResponse.json({
      success: true,
      sentCount: targetSubs.length,
      title,
      body,
    });
  } catch (error) {
    console.error("Error dispatching push notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
