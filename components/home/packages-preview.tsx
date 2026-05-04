// components/home/packages-preview.tsx
// Section 3 — Preview 3 paket teratas + CTA "Lihat Semua Paket"
// Fase B: warm white background, no gold accents (kecuali badge Terpopuler)

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { packages } from "@/data/packages";
import { formatPrice } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { btn } from "@/lib/button-classes";

const previewPackages = packages
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .slice(0, 3);

/* ─── Package Card ───────────────────────────────────────── */

function PackageCard({ pkg }: { pkg: (typeof packages)[0] }) {
  return (
    <div
      className={[
        "relative flex flex-col rounded-2xl border p-4 sm:p-6 md:p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm group",
        pkg.isPopular
          ? "border-[#E0E0DA] bg-white ring-2 ring-[#1A1A1A] ring-offset-2 ring-offset-[#FAFAF8] scale-[1.02]"
          : "border-[#E0E0DA] bg-white hover:border-[#1A1A1A]/20",
      ].join(" ")}
    >
      {/* Badge Terpopuler — hitam bukan gold */}
      {pkg.isPopular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1 bg-[#1A1A1A] text-[#FAFAF8] text-xs font-bold tracking-widest uppercase rounded-full shadow-md whitespace-nowrap">
          ★ Terpopuler
        </span>
      )}

      {/* Header Card */}
      <div className="mb-6">
        <h3
          className="text-lg font-semibold text-[#1A1A1A] mb-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {pkg.name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span
            className="text-2xl sm:text-4xl font-bold text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {formatPrice(pkg.price)}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-[#888888]">
          <span>{pkg.duration}</span>
          <span className="w-1 h-1 rounded-full bg-[#888888]" />
          <span>{pkg.photoCount}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E0E0DA] mb-6" />

      {/* Features */}
      <ul className="flex-1 space-y-3 mb-8">
        {pkg.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check
              size={15}
              className="flex-shrink-0 mt-0.5 text-[#1D9E75]"
              strokeWidth={2.5}
            />
            <span className="text-sm text-[#3A3A3A] leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={getWhatsAppUrl("package", pkg.name)}
        target="_blank"
        rel="noopener noreferrer"
        className={["w-full justify-center", pkg.isPopular ? btn.whatsapp : btn.secondary].join(" ")}
      >
        Tanya via WhatsApp
      </a>
    </div>
  );
}

/* ─── Main Section ───────────────────────────────────────── */

export function PackagesPreview() {
  return (
    <section
      id="packages"
      className="relative bg-[#FAFAF8] py-24 lg:py-32"
      aria-labelledby="packages-heading"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-14 lg:mb-16">
          {/* Counter paket — bukan eyebrow biasa */}
          <p className="text-sm font-medium text-[#888888] mb-4">
            {packages.length} paket tersedia
          </p>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h2
              id="packages-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Pilih Paket Foto
            </h2>
            <p className="text-[#5A5A5A] text-sm max-w-xs leading-relaxed">
              Pilih paket sesuai kebutuhan Anda. Semua paket sudah termasuk
              editing profesional dan file resolusi tinggi.
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {previewPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/packages"
            className={`group ${btn.secondary} rounded-full px-10 py-4`}
          >
            Lihat Semua Paket
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
