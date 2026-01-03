import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Soul Mobile Detailing LLC | Professional Mobile Car Detailing",
  description: "Professional mobile detailing services that restore your vehicle's beauty and protect your investment. Interior, exterior, and full detail packages. We come to you!",
  keywords: ["mobile detailing", "car detailing", "auto detailing", "vehicle detailing", "car wash", "interior detailing", "exterior detailing"],
  authors: [{ name: "Soul Mobile Detailing LLC" }],
  openGraph: {
    title: "Soul Mobile Detailing LLC | Professional Mobile Car Detailing",
    description: "Professional mobile detailing services that restore your vehicle's beauty and protect your investment. We come to your location!",
    url: "https://soulmobiledetailingllc.com",
    siteName: "Soul Mobile Detailing LLC",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1200&h=630&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Soul Mobile Detailing - Professional Car Detailing Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Soul Mobile Detailing LLC | Professional Mobile Car Detailing",
    description: "Professional mobile detailing services. We come to your location!",
    images: ["https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1200&h=630&fit=crop&q=80"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
