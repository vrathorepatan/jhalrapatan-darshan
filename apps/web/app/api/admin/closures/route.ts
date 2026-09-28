import { NextRequest, NextResponse } from "next/server";
import { getClosures, addClosure, deleteClosure } from "@/lib/db";

export const dynamic = "force-dynamic";

function checkAuth(req: NextRequest) {
  const cookie = req.cookies.get("jd_admin_session");
  return cookie?.value === "authenticated";
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ success: true, closures: getClosures() });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { from, to, message_hi, message_en, notifySubscribers } = body;
    if (!from || !to) {
      return NextResponse.json({ error: "From and to dates are required" }, { status: 400 });
    }

    const created = addClosure(
      {
        from,
        to,
        message_hi: message_hi || "दर्शन पट बंद हैं।",
        message_en: message_en || "Darshan is closed.",
        notifySubscribers: Boolean(notifySubscribers),
      },
      "admin"
    );

    return NextResponse.json({ success: true, closure: created });
  } catch (error) {
    console.error("Error creating closure:", error);
    return NextResponse.json({ error: "Failed to create closure" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Closure ID is required" }, { status: 400 });
    }

    const deleted = deleteClosure(id, "admin");
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error("Error deleting closure:", error);
    return NextResponse.json({ error: "Failed to delete closure" }, { status: 500 });
  }
}
