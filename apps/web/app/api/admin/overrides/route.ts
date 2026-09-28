import { NextRequest, NextResponse } from "next/server";
import { getOverrides, addOverride, deleteOverride } from "@/lib/db";

export const dynamic = "force-dynamic";

function checkAuth(req: NextRequest) {
  const cookie = req.cookies.get("jd_admin_session");
  return cookie?.value === "authenticated";
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ success: true, overrides: getOverrides() });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { date, type, slot, slotId, message_hi, message_en } = body;
    if (!date || !type) {
      return NextResponse.json({ error: "Date and type are required" }, { status: 400 });
    }

    const created = addOverride(
      {
        date,
        type,
        slot,
        slotId,
        message_hi,
        message_en,
        createdBy: "admin",
      },
      "admin"
    );

    return NextResponse.json({ success: true, override: created });
  } catch (error) {
    console.error("Error creating override:", error);
    return NextResponse.json({ error: "Failed to create override" }, { status: 500 });
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
      return NextResponse.json({ error: "Override ID is required" }, { status: 400 });
    }

    const deleted = deleteOverride(id, "admin");
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error("Error deleting override:", error);
    return NextResponse.json({ error: "Failed to delete override" }, { status: 500 });
  }
}
