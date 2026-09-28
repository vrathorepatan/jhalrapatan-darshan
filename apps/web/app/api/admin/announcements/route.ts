import { NextRequest, NextResponse } from "next/server";
import { getAnnouncements, saveAnnouncement, readDb, writeDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function checkAuth(req: NextRequest) {
  const cookie = req.cookies.get("jd_admin_session");
  return cookie?.value === "authenticated";
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ success: true, announcements: getAnnouncements() });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, message_hi, message_en, startsAt, endsAt, active } = body;

    const ann = {
      id: id || `ann-${Date.now()}`,
      message_hi: message_hi || "",
      message_en: message_en || "",
      startsAt: startsAt || new Date().toISOString(),
      endsAt: endsAt || new Date(Date.now() + 7 * 86400000).toISOString(),
      active: active !== undefined ? Boolean(active) : true,
    };

    saveAnnouncement(ann, "admin");
    return NextResponse.json({ success: true, announcement: ann });
  } catch (error) {
    console.error("Error saving announcement:", error);
    return NextResponse.json({ error: "Failed to save announcement" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const db = readDb();
    db.announcements = db.announcements.filter((a) => a.id !== id);
    writeDb(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
