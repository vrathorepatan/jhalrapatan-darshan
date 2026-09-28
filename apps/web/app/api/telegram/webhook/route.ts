import { NextRequest, NextResponse } from "next/server";
import { getLiveState, getEffectiveSlots } from "@jd/shared";
import {
  readDb,
  setManualLiveState,
  addClosure,
  addOverride,
} from "@/lib/db";

export const dynamic = "force-dynamic";

async function sendTelegramMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log(`[TELEGRAM MOCK -> ${chatId}]: ${text}`);
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
  } catch (err) {
    console.error("Failed to send telegram message:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const message = update.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const userId = String(message.from?.id || "");
    const text = message.text.trim();

    // Check allowed user IDs
    const allowedIds = (process.env.TELEGRAM_ALLOWED_USER_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (allowedIds.length > 0 && !allowedIds.includes(userId)) {
      await sendTelegramMessage(
        chatId,
        "⛔ क्षमा करें, आपको यह कमांड चलाने की अनुमति नहीं है।"
      );
      return NextResponse.json({ ok: true });
    }

    const now = new Date();
    const db = readDb();

    if (text.startsWith("/status")) {
      const state = getLiveState(now, db.schedules, db.overrides, db.closures);
      const isManual = db.heartbeat?.isManualLive;
      const isLive = state.isLive || isManual;
      const current = state.currentSlot?.name_hi || (isManual ? db.heartbeat?.manualLiveSlotName || "विशेष दर्शन" : "कोई नहीं");
      const next = state.nextSlot?.name_hi || "अज्ञात";
      const health = db.heartbeat?.ingestConnected ? "🟢 कनेक्टेड" : "🔴 डिस्कनेक्टेड";

      const reply = `*🚩 झालरापाटन दर्शन स्थिति:*
• लाइव स्थिति: ${isLive ? "🔴 लाइव चल रहा है" : "⚪ पट बंद हैं"}
• वर्तमान आरती: ${current}
• अगली आरती: ${next}
• कैमरा इनजेस्ट: ${health}
• बिटरेट: ${db.heartbeat?.bitrate || 0} kbps`;

      await sendTelegramMessage(chatId, reply);
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/shuru")) {
      setManualLiveState(true, "विशेष दर्शन (टेलीग्राम द्वारा)", `telegram:${userId}`);
      await sendTelegramMessage(
        chatId,
        "✅ *लाइव प्रसारण तुरंत शुरू कर दिया गया है।* वेबसाइट और यूट्यूब पर लाइव चालू है।"
      );
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/roko")) {
      setManualLiveState(false, "", `telegram:${userId}`);
      await sendTelegramMessage(
        chatId,
        "🛑 *लाइव प्रसारण बंद कर दिया गया है।* पट बंद का संदेश वेबसाइट पर प्रदर्शित है।"
      );
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/band")) {
      const reason = text.replace("/band", "").trim() || "आज अपरिहार्य कारणों से दर्शन बंद रहेंगे।";
      const today = now.toISOString().slice(0, 10);
      addClosure(
        {
          from: `${today}T00:00:00.000Z`,
          to: `${today}T23:59:59.000Z`,
          message_hi: reason,
          message_en: "Darshan is closed today.",
          notifySubscribers: true,
        },
        `telegram:${userId}`
      );
      setManualLiveState(false, "", `telegram:${userId}`);
      await sendTelegramMessage(
        chatId,
        `⚠️ *आज दर्शन बंद कर दिए गए हैं।*\nकारण: ${reason}\nसभी लाइव स्ट्रीम रोक दी गई हैं।`
      );
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/kal")) {
      const tomorrow = new Date(now.getTime() + 86400000);
      const slots = getEffectiveSlots(tomorrow, db.schedules, db.overrides, db.closures);
      let reply = "*🗓️ कल का दर्शन समय:*\n";
      slots.forEach((s) => {
        reply += `• ${s.name_hi}: ${s.start} - ${s.end}\n`;
      });
      await sendTelegramMessage(chatId, reply);
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/samay")) {
      // Usage: /samay <slotId/aarti> <HH:MM>
      const parts = text.split(" ");
      if (parts.length < 3) {
        await sendTelegramMessage(chatId, "उपयोग: `/samay <rajbhog/sandhya> <12:30>`");
        return NextResponse.json({ ok: true });
      }
      const slotQuery = parts[1].toLowerCase();
      const newTime = parts[2];
      const today = now.toISOString().slice(0, 10);

      // Find matching slot in schedule
      const slots = getEffectiveSlots(now, db.schedules, db.overrides, db.closures);
      const matched = slots.find(
        (s) =>
          s.id.toLowerCase().includes(slotQuery) ||
          s.name_en.toLowerCase().includes(slotQuery) ||
          s.name_hi.includes(slotQuery)
      );

      if (!matched) {
        await sendTelegramMessage(chatId, `❌ आरती "${slotQuery}" नहीं मिली।`);
        return NextResponse.json({ ok: true });
      }

      addOverride(
        {
          date: today,
          type: "modify",
          slotId: matched.id,
          slot: {
            ...matched,
            start: newTime,
          },
          message_hi: `${matched.name_hi} का समय बदलकर ${newTime} किया गया।`,
          createdBy: `telegram:${userId}`,
        },
        `telegram:${userId}`
      );

      await sendTelegramMessage(
        chatId,
        `✅ *समय परिवर्तित!* आज ${matched.name_hi} का समय ${newTime} कर दिया गया है।`
      );
      return NextResponse.json({ ok: true });
    }

    // Default help message
    await sendTelegramMessage(
      chatId,
      `*उपलब्ध कमांड:*
• \`/status\` - लाइव स्थिति व कैमरा हेल्थ
• \`/shuru\` - तुरंत लाइव शुरू करें
• \`/roko\` - लाइव बंद करें
• \`/band [कारण]\` - आज दर्शन स्थगित करें
• \`/samay <आरती> <समय>\` - आज आरती समय बदलें
• \`/kal\` - कल का कार्यक्रम देखें`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
