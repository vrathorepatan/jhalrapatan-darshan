import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";

export const metadata: Metadata = {
  title: {
    default: "झालरापाटन दर्शन – श्री द्वारकाधीश मंदिर",
    template: "%s | झालरापाटन दर्शन",
  },
  description:
    "श्री द्वारकाधीश मंदिर, झालरापाटन का सीधा प्रसारण देखें। दर्शन समय, आरती सूचना, उत्सव कैलेंडर और झालरापाटन के सभी मंदिरों की जानकारी।",
  keywords: [
    "Jhalrapatan darshan",
    "Dwarkadhish mandir",
    "झालरापाटन दर्शन",
    "द्वारकाधीश मंदिर",
    "live aarti",
    "Jhalawar temple",
  ],
  authors: [{ name: "श्री द्वारकाधीश मंदिर समिति, झालरापाटन" }],
  creator: "Jhalrapatan Darshan",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "झालरापाटन दर्शन",
  },
  openGraph: {
    type: "website",
    locale: "hi_IN",
    alternateLocale: "en_IN",
    siteName: "झालरापाटन दर्शन",
    title: "झालरापाटन दर्शन – श्री द्वारकाधीश मंदिर",
    description:
      "श्री द्वारकाधीश मंदिर, झालरापाटन का सीधा प्रसारण देखें।",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "झालरापाटन दर्शन",
    description: "श्री द्वारकाधीश मंदिर लाइव दर्शन",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#E65100",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <div className="page-shell">
          <AnnouncementBanner />
          <main>{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
