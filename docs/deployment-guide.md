# मंदिर सिस्टम डिप्लॉयमेंट निर्देशिका (Deployment Guide)

> **श्री द्वारकाधीश मंदिर, झालरापाटन**  
> वेब एप्लिकेशन (Vercel) एवं मंदिर कंट्रोलर (Ubuntu Systemd) परिनियोजन

---

## 1. वेब एप्लिकेशन डिप्लॉयमेंट (Next.js on Vercel)

### 1.1 Vercel पर प्रोजेक्ट जोड़ना
1. GitHub पर कोड रिपॉजिटरी पुश करें।
2. [vercel.com](https://vercel.com) में लॉगिन कर **New Project** चुनें और रिपॉजिटरी आयात करें।
3. **Framework Preset:** `Next.js`
4. **Root Directory:** `apps/web`
5. **Build Command:** `pnpm build`

### 1.2 एनवायरनमेंट वेरिएबल्स (Environment Variables)
Vercel प्रोजेक्ट सेटिंग्स में निम्नलिखित वेरिएबल्स जोड़ें:

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://darshan.jhalrapatan.org
NEXT_PUBLIC_DEFAULT_YOUTUBE_ID=jfKfPfyJRdk
ADMIN_PASSWORD=Dwarkadhish@123
STREAM_CONTROLLER_TOKEN=your_secure_random_token_here
CRON_SECRET=your_secure_cron_secret_here
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@jhalrapatan.org
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
TELEGRAM_ALLOWED_USER_IDS=12345678,87654321
TZ=Asia/Kolkata
```

---

## 2. शेड्यूलर क्रॉन सेटअप (Automated Cron Job)

Vercel के फ्री टियर पर हर मिनट क्रॉन चलाना सीमित होता है, अतः [cron-job.org](https://cron-job.org) अथवा Supabase Scheduled Edge Function द्वारा सेट करें:

- **URL:** `https://darshan.jhalrapatan.org/api/cron/check-schedule`
- **Method:** `POST`
- **Frequency:** प्रति 1 मिनट (`* * * * *`)
- **Headers:**
  - `Authorization`: `Bearer your_secure_cron_secret_here`
  - `Content-Type`: `application/json`

यह क्रॉन प्रत्येक मिनट आरती समय की जांच कर 10 मिनट पहले पुश नोटिफिकेशन और लाइव शुरू होने पर संदेश प्रसारित करता है।

---

## 3. मंदिर पीसी सेटअप (Temple PC Ubuntu Setup)

### 3.1 सिस्टम तैयारी
Ubuntu 24.04 सर्वर पर आवश्यक पैकेज इंस्टॉल करें:

```bash
# सिस्टम अपडेट
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS और FFmpeg इंस्टॉल करें
sudo apt install -y curl git ffmpeg

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm इंस्टॉल करें
sudo npm install -g pnpm
```

### 3.2 प्रोजेक्ट डायरेक्टरी व उपयोगकर्ता
```bash
# सुरक्षित उपयोगकर्ता बनाएं
sudo useradd -m -s /bin/bash darshan

# प्रोजेक्ट डायरेक्टरी
sudo mkdir -p /opt/jhalrapatan-darshan
sudo chown -R darshan:darshan /opt/jhalrapatan-darshan

# कोड क्लोन करें
cd /opt/jhalrapatan-darshan
sudo -u darshan git clone https://github.com/your-org/jhalrapatan-darshan.git .
sudo -u darshan pnpm install
sudo -u darshan pnpm --filter @jd/shared build
sudo -u darshan pnpm --filter @jd/stream-controller build
```

### 3.3 एनवायरनमेंट फ़ाइल कॉन्फ़िगर करें
```bash
sudo -u darshan nano /opt/jhalrapatan-darshan/apps/stream-controller/.env
```
(कंट्रोलर के सभी वेरिएबल्स जैसे `CAMERA_URL`, `YOUTUBE_STREAM_KEY`, `WEB_API_URL`, `STREAM_CONTROLLER_TOKEN` दर्ज करें)

### 3.4 सिस्टमडी सर्विस सक्रिय करना
```bash
# सर्विस फ़ाइल कॉपी करें
sudo cp /opt/jhalrapatan-darshan/apps/stream-controller/systemd/jhalrapatan-stream.service /etc/systemd/system/

# सिस्टमडी रीलोड करें
sudo systemctl daemon-reload

# सर्विस प्रारंभ करें और बूट पर स्वतः चालू करें
sudo systemctl enable jhalrapatan-stream
sudo systemctl start jhalrapatan-stream

# स्थिति जांचें
sudo systemctl status jhalrapatan-stream
```

### 3.5 लाइव लॉग देखना (Log Monitoring)
```bash
# रियल-टाइम लॉग्स देखने हेतु:
sudo journalctl -u jhalrapatan-stream -f
```

---

## 4. डेटा बैकअप और पुनर्स्थापना (Backup & Restore)

मंदिर के समय, फेरबदल और घोषणाओं का डेटा `data/db-store.json` में संचित रहता है।

### दैनिक बैकअप स्क्रिप्ट (Linux Cron):
```bash
# प्रतिदिन रात्रि 11:59 पर बैकअप
59 23 * * * cp /opt/jhalrapatan-darshan/data/db-store.json /var/backups/db-store-$(date +\%F).json
```

### पुनर्स्थापना (Restore):
किसी अप्रत्याशित समस्या की स्थिति में बैकअप फ़ाइल को पुनः कॉपी करें:
```bash
cp /var/backups/db-store-YYYY-MM-DD.json /opt/jhalrapatan-darshan/data/db-store.json
```
वेब ऐप स्वतः नई स्थिति को लोड कर लेता है।
