// app/layout.tsx — Root layout dengan font, metadata, navbar, footer, WA button

import type { Metadata } from "next";
import { Syne, DM_Sans, Montserrat } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";

/* ─── Fonts ─────────────────────────────────────────────── */

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

/* ─── Metadata ────────────────────────────────────────────── */

export const metadata: Metadata = {
  metadataBase: new URL("https://snappeachystudio.id"),
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
    "Snappeachy Studio",
  ],
  openGraph: {
    type: "website",
    url: "https://snappeachystudio.id",
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
  alternates: { canonical: "https://snappeachystudio.id" },
  robots: { index: true, follow: true },
};

/* ─── Root Layout ─────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${syne.variable} ${dmSans.variable} ${montserrat.variable}`}>
      <body className="bg-[#FAFAF8] text-[#1A1A1A] font-[family-name:var(--font-dm-sans)] antialiased">
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
