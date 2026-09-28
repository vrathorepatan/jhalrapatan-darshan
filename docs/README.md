# झालरापाटन दर्शन – संपूर्ण सिस्टम निर्देशिका (System Manual)

> **श्री द्वारकाधीश मंदिर, झालरापाटन (राजस्थान)**  
> 24x7 कैमरा इनजेस्ट, स्वचालित दर्शन प्रसारण व तीर्थ सूचना पोर्टल

---

## 1. प्रोजेक्ट संरचना (Repository Layout)

```
jhalrapatan-darshan/
├── apps/
│   ├── web/                    → Next.js 16 (App Router) + TypeScript + Tailwind CSS
│   └── stream-controller/      → Node.js + TypeScript 24x7 सिस्टमडी सेवा
├── packages/
│   └── shared/                 → शेड्यूल इंजन, प्रकार (Types) व 12 स्वचालित टेस्ट
├── data/
│   ├── mandir.json             → मंदिर इतिहास, नियम, संपर्क व पहुंचने का मार्ग
│   ├── schedule.json           → ग्रीष्म व शीतकालीन दर्शन समय
│   ├── festivals.json          → हिंदू पंचांग उत्सव व विवरण
│   └── temples.json            → झालरापाटन के प्रमुख 5+ मंदिरों की जानकारी व निर्देशांक
├── docs/
│   ├── README.md               → मुख्य तकनीकी निर्देशिका
│   ├── hardware-guide.md       → कैमरा, पीसी, एफएफमपेग व बैंडविड्थ गाइड
│   └── deployment-guide.md     → वर्सेल व मंदिर पीसी डिप्लॉयमेंट गाइड
├── .env.example                → वेब ऐप और कंट्रोलर के एनवायरनमेंट वेरिएबल्स
└── pnpm-workspace.yaml         → pnpm वर्कस्पेस कॉन्फ़िगरेशन
```

---

## 2. मुख्य विशेषताएं (Key Features)

1. **स्वचालित लाइव दर्शन (Automatic Scheduled Live Stream):**
   - मंदिर का कैमरा 24x7 इनजेस्ट पर चलता रहता है।
   - आरती के तय समय पर यूट्यूब, फ़ेसबुक और वेबसाइट पर लाइव प्लेयर स्वतः प्रकट हो जाता है।
   - आरती समाप्त होने पर प्रसारण स्वतः बंद होकर पट बंद का संदेश प्रदर्शित होता है।

2. **शेड्यूल इंजन (Single Source of Truth):**
   - एशिया/कोलकाता समय क्षेत्र पर आधारित।
   - प्राथमिकता क्रम: **पट बंदी (Closure)** > **विशेष फेरबदल (Override)** > **मौसमी समय (Regular Schedule)**।

3. **मोबाइल-फ़र्स्ट PWA (Progressive Web App):**
   - 360px से 1280px तक रेस्पॉन्सिव।
   - ऑफ़लाइन सपोर्ट व वेब मेनिफेस्ट।
   - वेब पुश नोटिफिकेशन (आरती से 10 मिनट पहले व लाइव शुरू होने पर)।
   - स्टिकी मिनी-प्लेयर (स्क्रॉल करने पर छोटा वीडियो प्लेयर)।

4. **प्रबंधन कक्ष (Admin Panel - `/admin`):**
   - **डैशबोर्ड:** कैमरा सिग्नल, बिटरेट, अपटाइम और त्वरित लाइव प्रारंभ/समाप्त बटन।
   - **समय संपादक:** ग्रीष्म व शीतकालीन 6 आरतियों के समय में संशोधन।
   - **विशेष फेरबदल:** किसी विशिष्ट तारीख़ पर आरती समय परिवर्तन अथवा अतिरिक्त आरती जोड़ना।
   - **पट बंदी:** ग्रहण या विशेष सेवा के समय दर्शन बंद की सार्वजनिक घोषणा।
   - **सूचना पट्टी:** होमपेज पर विशेष घोषणा पट्टी लगाना।
   - **ऑडिट लॉग:** किए गए प्रत्येक बदलाव का समयबद्ध रिकॉर्ड।

5. **टेलीग्राम बॉट (`/api/telegram/webhook`):**
   - पुजारी एवं मंदिर ट्रस्टी मोबाइल से आसानी से कमांड दे सकते हैं:
     - `/status` – लाइव स्थिति व कैमरा सिग्नल
     - `/shuru` – तुरंत लाइव शुरू करें
     - `/roko` – लाइव बंद करें
     - `/band [कारण]` – आज दर्शन स्थगित करें
     - `/samay rajbhog 12:00` – आज आरती का समय बदलें
     - `/kal` – कल का समय देखें

---

## 3. तृतीय-पक्ष API सेटअप (Third-Party API Setup)

### 3.1 यूट्यूब लाइव स्ट्रीमिंग API (YouTube Live Streaming API v3)
1. **Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)) पर नया प्रोजेक्ट बनाएं।
2. **YouTube Data API v3** सक्षम करें।
3. **OAuth 2.0 Credentials** (Web Application / Desktop App) बनाएं:
   - `YOUTUBE_CLIENT_ID`
   - `YOUTUBE_CLIENT_SECRET`
4. **Google OAuth 2.0 Playground** पर जाकर निम्नलिखित स्कोप जोड़कर `YOUTUBE_REFRESH_TOKEN` प्राप्त करें:
   - `https://www.googleapis.com/auth/youtube.force-ssl`
5. **यूट्यूब स्टूडियो** में जाकर एक स्थायी लाइव स्ट्रीम (Persistent Live Stream) बनाएं जिसका ऑटो-स्टार्ट और ऑटो-स्टॉप **बंद (disabled)** हो। इसकी स्ट्रीम कुंजी `YOUTUBE_STREAM_KEY` में रखें।

### 3.2 फ़ेसबुक लाइव वीडियो API (Facebook Live Video API)
1. [developers.facebook.com](https://developers.facebook.com) पर मंदिर के फ़ेसबुक पेज के लिए ऐप बनाएं।
2. आवश्यक अनुमतियां: `pages_manage_posts`, `pages_read_engagement`, `publish_video`।
3. पेज एक्सेस टोकन (`FACEBOOK_PAGE_ACCESS_TOKEN`) और पेज आईडी (`FACEBOOK_PAGE_ID`) प्राप्त करें।

### 3.3 वेब पुश VAPID कीज़ (Web Push Notification)
Node.js में VAPID कीज जनरेट करें:
```bash
npx web-push generate-vapid-keys
```
आउटपुट कीज को `.env` में दर्ज करें:
```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@jhalrapatan.org
```

### 3.4 टेलीग्राम बॉट (Telegram Bot Setup)
1. टेलीग्राम पर `@BotFather` को `/newbot` संदेश भेजें।
2. प्राप्त बॉट टोकन को `TELEGRAM_BOT_TOKEN` में रखें।
3. अधिकृत उपयोगकर्ताओं की टेलीग्राम आईडी `@userinfobot` से प्राप्त कर `TELEGRAM_ALLOWED_USER_IDS` में कॉमा लगाकर दर्ज करें (उदा. `12345678,98765432`)।
4. वेबहूक सेट करें:
```bash
curl -F "url=https://your-domain.com/api/telegram/webhook" https://api.telegram.org/bot<TOKEN>/setWebhook
```

---

## 4. स्थानीय वातावरण में चलाना (Local Development)

```bash
# 1. रिपॉजिटरी क्लोन करें
cd "d:\Jhalrapatan, Darshan"

# 2. डिपेंडेंसी इंस्टॉल करें
pnpm install

# 3. शेयर्ड पैकेज के टेस्ट चलाएं
pnpm --filter @jd/shared test

# 4. वेब ऐप चलाएं
pnpm --filter web dev

# 5. ब्राउज़र में खोलें
# वेबसाइट: http://localhost:3000
# एडमिन कक्ष: http://localhost:3000/admin (डिफ़ॉल्ट पासवर्ड: Dwarkadhish@123)
```
