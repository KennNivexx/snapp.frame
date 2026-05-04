// app/page.tsx — Landing Page lengkap (FASE 2 + FASE 3) + JSON-LD LocalBusiness schema

import type { Metadata } from "next";
import Script from "next/script";
import { site } from "@/data/site";
import { HeroSection } from "@/components/home/hero-section";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { PackagesPreview } from "@/components/home/packages-preview";
import { AboutSection } from "@/components/home/about-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { ContactSection } from "@/components/home/contact-section";

export const metadata: Metadata = {
  title: `${site.name} — Studio Foto Minimalis Modern`,
  description: site.description,
  openGraph: {
    url: "https://snappeachystudio.id",
  },
  alternates: {
    canonical: "https://snappeachystudio.id",
  },
};

/* ─── JSON-LD LocalBusiness Schema ───────────────────────── */

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://snappeachystudio.id",
  name: site.name,
  description: site.description,
  url: "https://snappeachystudio.id",
  image: "https://snappeachystudio.id/og-image.png",
  logo: "https://snappeachystudio.id/logo.svg",
  telephone: `+${site.contact.whatsapp}`,
  email: site.contact.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.contact.address,
    addressCountry: "ID",
  },
  openingHoursSpecification: site.operatingHours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    name: h.day,
    description: h.hours,
  })),
  sameAs: [site.contact.instagram, site.contact.tiktok],
  priceRange: "Rp 150.000 – Rp 300.000",
};

/* ─── Page ───────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Schema untuk SEO lokal */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        strategy="afterInteractive"
      />

      {/* Section 1 — Hero */}
      <HeroSection />

      {/* Section 2 — Gallery Preview */}
      <GalleryPreview />

      {/* Section 3 — Packages Preview */}
      <PackagesPreview />

      {/* Section 4 — About */}
      <AboutSection />

      {/* Section 5 — Testimonials */}
      <TestimonialsSection />

      {/* Section 6 — How It Works */}
      <HowItWorksSection />

      {/* Section 7 — Contact & Location */}
      <ContactSection />
    </>
  );
}
