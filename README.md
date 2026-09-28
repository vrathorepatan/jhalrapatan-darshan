# 🛕 Jhalrapatan Darshan — City of Bells (झालरापाटन दर्शन)

> **आध्यात्मिक, सांस्कृतिक एवं ऐतिहासिक धरोहर का डिजिटल अनुभव**
> "घंटियों का शहर - झालरापाटन, झालावाड़, राजस्थान"

---

## 🌟 प्रोजेक्ट की मुख्य विशेषताएं (Key Features Built)

1. **🎨 Premium Cultural Design System**:
   - हेरिटेज राजस्थानी कलर पैलेट (Terracotta, Sunburst Gold, Sandstone, Deep Night)
   - देवनागरी टाइपोग्राफी (Cinzel Decorative, Rozha One, Poppins)
   - स्मूथ एनीमेशन्स, ग्लास मॉर्फिज़्म और रिस्पॉन्सिव लेआउट।

2. **🗺️ Interactive Map & Heritage Exploration**:
   - झालरापाटन के सभी प्रमुख मंदिरों और स्थलों की लिस्टिंग
   - सूर्य मंदिर (Padmanabha Temple / Sun Temple), शांतिनाथ दिगंबर जैन अतिशय क्षेत्र, द्वारकाधीश जी, गोमती सागर, चंद्रभागा मंदिर समूह।
   - दूरी, खुलने का समय, इतिहास और दर्शन गाइड।

3. **🔔 Dynamic Soundscape & Audio Guide**:
   - मंदिर की घंटियों और आरती का अनुभव।
   - बहुभाषी ऑडियो गाइड (हिंदी, English, हाड़ौती)।

4. **🪔 Live Darshan & Aarti Simulator**:
   - लाइव आरती टाइमिंग और वर्चुअल दर्शन।
   - दिया प्रज्ज्वलन और पुष्प अर्पण का इंटरएक्टिव डिजिटल अनुभव।

5. **🌐 Multi-Language Support**:
   - हिंदी, English और स्थानीय हाड़ौती भाषा का सहज विकल्प।

---

## 🚀 प्रोजेक्ट को दोबारा कैसे चलाएं (How to Run Locally)

### 1. प्रोजेक्ट फोल्डर में जाएं
```powershell
cd "d:\Jhalrapatan, Darshan"
```

### 2. लोकल सर्वर स्टार्ट करें
```powershell
pnpm --filter web dev
```
👉 ब्राउज़र में खोलें: `http://localhost:3000`

---

## 🔗 किसी को शेयर करने के लिए (Public Sharing via Cloudflare)

जब भी आपको यह वेबसाइट किसी दोस्त या क्लाइंट को मोबाइल/इंटरनेट पर दिखानी हो:

1. लोकल सर्वर चलने दें (`pnpm --filter web dev`)
2. एक नई PowerShell विंडो में यह कमांड चलाएं:
```powershell
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:3000
```
3. स्क्रीन पर एक `https://....trycloudflare.com` लिंक मिलेगा — इसे किसी को भी भेजें! बिना किसी पासवर्ड के वेबसाइट तुरंत खुल जाएगी।

---

## 📦 प्रोजेक्ट संरचना (Folder Structure)

```
d:\Jhalrapatan, Darshan\
├── apps/
│   └── web/                   # Next.js 14 App Router, Tailwind/Vanilla CSS, Three.js
│       ├── app/               # Routes, Pages, API endpoints
│       ├── components/        # Reusable UI components (Temples, Audio, Aarti)
│       └── public/            # High-resolution audio, icons, assets
├── packages/                  # Shared configs & UI packages
├── data/                      # Temples, history, festival JSON datasets
├── docs/                      # Architecture & Spec docs
└── Jhalrapatan-Darshan-Antigravity-Spec.md
```

---

*सेशन सफलतापूर्वक सुरक्षित (Saved) कर दिया गया है।*
