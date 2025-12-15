import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "תחנות השאלת גלגלים - ידידים",
  description: "מערכת לניהול ומעקב בתחנות השאלת גלגלים",
  manifest: "/manifest.json",
  themeColor: "#374151",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "גלגלים",
  },
  icons: {
    icon: "/logo.wheels.png",
    apple: "/logo.wheels.png",
  },
  openGraph: {
    title: "תחנות השאלת גלגלים - ידידים",
    description: "מערכת לניהול ומעקב בתחנות השאלת גלגלים",
    images: [
      {
        url: "/logo.wheels.png",
        width: 512,
        height: 512,
        alt: "לוגו תחנות גלגלים ידידים",
      },
    ],
    locale: "he_IL",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${rubik.className} antialiased`}>
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
