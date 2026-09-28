import { NextRequest, NextResponse } from "next/server";
import { updateStreamHeartbeat } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.STREAM_CONTROLLER_TOKEN || "jd-secret-stream-token";

    // Verify bearer token
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ingestConnected, bitrate, uptime } = body;

    const updated = updateStreamHeartbeat({
      ingestConnected: Boolean(ingestConnected),
      bitrate: Number(bitrate) || 0,
      uptime: Number(uptime) || 0,
    });

    return NextResponse.json({ success: true, heartbeat: updated });
  } catch (error) {
    console.error("Error processing stream heartbeat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
