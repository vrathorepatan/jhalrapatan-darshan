import { NextRequest, NextResponse } from "next/server";
import { addPushSubscription } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint, keys, aartis } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }

    const saved = addPushSubscription({
      endpoint,
      keys,
      aartis: aartis || ["all"],
    });

    return NextResponse.json({ success: true, subscription: saved });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
