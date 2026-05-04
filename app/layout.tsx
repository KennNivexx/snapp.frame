// app/layout.tsx — Root layout dengan font, metadata, navbar, footer, WA button

import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";

/* ─── Fonts ─────────────────────────────────────────────── */

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

/* ─── Metadata ────────────────────────────────────────────── */

export const metadata: Metadata = {
  metadataBase: new URL("https://snappframe.id"),
  title: {
    default: `${site.name} — Studio Foto Minimalis Modern`,
    template: `%s │ ${site.name}`,
  },
  description: site.description,
  keywords: [
    "studio foto",
    "photobooth",
    "foto minimalis",
    "foto portrait",
    "Snapp.frame Studio",
  ],
  openGraph: {
    type: "website",
    url: "https://snappframe.id",
    title: `${site.name} — Studio Foto Minimalis Modern`,
    description: site.description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${site.name} — Studio Foto Minimalis Modern` }],
    siteName: site.name,
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Studio Foto Minimalis Modern`,
    description: site.description,
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://snappframe.id" },
  robots: { index: true, follow: true },
};

/* ─── Root Layout ─────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${outfit.variable} ${inter.variable}`}>
      <body className="bg-[#FAFAF8] text-[#1A1A1A] font-[family-name:var(--font-inter)] antialiased">
        {/* Global Navbar */}
        <Navbar />

        {/* Page Content */}
        <main>{children}</main>

        {/* Global Footer */}
        <Footer />

        {/* Floating WhatsApp Button — tampil di semua halaman */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
