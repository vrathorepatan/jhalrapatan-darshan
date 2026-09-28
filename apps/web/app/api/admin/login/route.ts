import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || "Dwarkadhish@123";

    if (!password || password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: "पासवर्ड गलत है (Invalid password)" },
        { status: 401 }
      );
    }

    const token = crypto.randomBytes(24).toString("hex");
    const response = NextResponse.json({
      success: true,
      message: "सफलतापूर्वक लॉगिन किया गया",
    });

    // Set HTTP-only secure cookie
    response.cookies.set({
      name: "jd_admin_session",
      value: "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
  }
}
