import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/db";

export const dynamic = "force-dynamic";

function checkAuth(req: NextRequest) {
  const cookie = req.cookies.get("jd_admin_session");
  return cookie?.value === "authenticated";
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ success: true, auditLogs: getAuditLogs() });
}
