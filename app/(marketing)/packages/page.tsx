// app/packages/page.tsx — Server Component
// Data packages dan FAQ di-fetch saat build time
// Accordion FAQ ada di FaqAccordion (client component)

import { MessageCircle, CalendarCheck } from "lucide-react";
import { packages } from "@/data/packages";
import { faqs } from "@/data/faq";
import { formatPrice } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { site } from "@/data/site";
import { btn } from "@/lib/button-classes";
import { FaqAccordion } from "@/components/packages/faq-accordion";
import { ExpandableFeatures } from "@/components/ui/expandable-features";

const sortedPackages = [...packages].sort((a, b) => a.sortOrder - b.sortOrder);

/* ─── Package Card ───────────────────────────────────────── */

function PackageCard({ pkg }: { pkg: (typeof packages)[0] }) {
  return (
    <div
      className={[
        "relative flex flex-col rounded-2xl border p-4 sm:p-8 transition-all duration-200 h-full hover:-translate-y-0.5 hover:shadow-sm group",
        pkg.isPopular
          ? "border-[#E0E0DA] bg-white ring-2 ring-[#1A1A1A] ring-offset-2 ring-offset-[#FAFAF8]"
          : "border-[#E0E0DA] bg-white hover:border-[#1A1A1A]/20",
      ].join(" ")}
    >
      {/* Badge Terpopuler — hitam bukan gold */}
      {pkg.isPopular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] sm:px-4 sm:py-1 sm:text-xs bg-[#1A1A1A] text-[#FAFAF8] font-bold tracking-widest uppercase rounded-full shadow-md whitespace-nowrap">
          ★ Terpopuler
        </span>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-xl font-semibold text-[#1A1A1A] mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {pkg.name}
        </h2>
        <div className="flex items-baseline gap-1 mb-3">
          {/* Harga — hitam bukan gold */}
          <span
            className="text-xl sm:text-4xl font-bold text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {formatPrice(pkg.price)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#888888]">
          <span className="flex items-center gap-1.5">
            {/* Bullet meta — muted */}
            <span className="w-1.5 h-1.5 rounded-full bg-[#888888]" />
            {pkg.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#888888]" />
            {pkg.photoCount}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E0E0DA] mb-6" />

      {/* Features — truncatable on mobile, full on desktop */}
      <div className="flex-1 mb-6">
        <ExpandableFeatures features={pkg.features} collapseAt={3} />
      </div>

      {/* CTA — dua tombol vertikal */}
      <div className="flex flex-col gap-2">
        {/* Tombol primer: langsung ke halaman booking */}
        <a
          href={`/booking?pkg=${pkg.id}`}
          className={[
            btn.primary,
            "w-full justify-center rounded-lg py-3.5",
          ].join(" ")}
        >
          <CalendarCheck size={16} />
          Pesan Sekarang
        </a>

        {/* Tombol sekunder: tanya via WhatsApp dulu */}
        <a
          href={getWhatsAppUrl("package", pkg.name)}
          target="_blank"
          rel="noopener noreferrer"
          className={[
            "inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg",
            "text-xs font-medium text-[#888888] tracking-wide",
            "border border-[#E0E0DA] bg-transparent hover:border-[#1A1A1A]/30",
            "transition-colors duration-200",
          ].join(" ")}
        >
          <MessageCircle size={14} />
          Tanya via WhatsApp
        </a>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */

export default function PackagesPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      {/* ── Page Header ── */}
      <div className="pt-32 pb-16 lg:pt-40 lg:pb-20
                      max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Eyebrow: muted tanpa gold */}
        <p className="text-xs font-medium tracking-[0.15em] text-[#888888] uppercase mb-4">
          Harga &amp; Paket
        </p>
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#1A1A1A] mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Paket Foto
        </h1>
        <p className="text-[#5A5A5A] text-base max-w-lg">
          Pilih paket yang sesuai kebutuhan Anda. Semua paket sudah termasuk editing
          profesional, file resolusi tinggi, dan pengiriman via Google Drive.
        </p>
      </div>

      {/* ── Packages Grid — 2 kolom (bukan 4) ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {sortedPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </div>

      {/* ── FAQ Section ── */}
      <div className="bg-[#F0EFE9] border-t border-[#E0E0DA]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto">
            {/* FAQ Header */}
            <div className="text-center mb-12">
              <p className="text-xs font-medium tracking-[0.15em] text-[#888888] uppercase mb-4">
                FAQ
              </p>
              <h2
                className="text-3xl sm:text-4xl font-semibold text-[#1A1A1A]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Pertanyaan Umum
              </h2>
              <p className="text-[#5A5A5A] text-sm mt-3">
                Tidak menemukan jawaban yang dicari? Hubungi kami via WhatsApp.
              </p>
            </div>

            {/* FAQ Accordion — client component */}
            <FaqAccordion faqs={faqs} />
          </div>
        </div>
      </div>

      {/* ── Bottom CTA Banner ── */}
      <div className="bg-[#FAFAF8] border-t border-[#E0E0DA]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-20">
          {/* Container — warm light, tanpa gold glow */}
          <div className="rounded-3xl border border-[#E0E0DA] bg-[#F0EFE9] px-8 py-12 lg:px-16 lg:py-16 text-center">
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1A1A1A] mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Masih ada pertanyaan?
            </h2>
            <p className="text-[#5A5A5A] text-sm mb-8 max-w-md mx-auto">
              Tim kami siap membantu Anda menemukan paket yang tepat dan merencanakan
              sesi foto yang berkesan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={getWhatsAppUrl("general")}
                target="_blank"
                rel="noopener noreferrer"
                className={btn.whatsapp}
              >
                <MessageCircle size={18} />
                Chat via WhatsApp
              </a>
              <a
                href={site.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={btn.secondary}
              >
                Instagram DM
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
