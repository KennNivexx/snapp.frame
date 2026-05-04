// components/home/packages-preview.tsx
// Section preview 3 paket — mobile-first, fitur truncatable

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { packages } from "@/data/packages";
import { formatPrice } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { btn } from "@/lib/button-classes";
import { ExpandableFeatures } from "@/components/ui/expandable-features";

const previewPackages = packages
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .slice(0, 3);

/* ─── Package Card ───────────────────────────────────────── */

function PackageCard({ pkg }: { pkg: (typeof packages)[0] }) {
  return (
    <div
      className={[
        "relative flex flex-col rounded-2xl border p-4 sm:p-6 transition-all duration-200 group",
        pkg.isPopular
          ? "border-[#E0E0DA] bg-white ring-2 ring-[#1A1A1A] ring-offset-2 ring-offset-[#FAFAF8]"
          : "border-[#E0E0DA] bg-white hover:border-[#1A1A1A]/25 hover:shadow-sm hover:-translate-y-0.5",
      ].join(" ")}
    >
      {/* Badge Terpopuler */}
      {pkg.isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-0.5 bg-[#1A1A1A] text-[#FAFAF8] text-[9px] sm:text-[10px] font-bold tracking-widest uppercase rounded-full shadow-md whitespace-nowrap">
          ★ Terpopuler
        </span>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3
          className="text-sm sm:text-base font-semibold text-[#1A1A1A] mb-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {pkg.name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span
            className="text-xl sm:text-3xl font-bold text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {formatPrice(pkg.price)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-2 text-[10px] sm:text-xs text-[#888888]">
          <span>{pkg.duration}</span>
          <span className="w-1 h-1 rounded-full bg-[#C0C0BC]" />
          <span>{pkg.photoCount}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E0E0DA] mb-4" />

      {/* Features — truncatable on mobile */}
      <div className="flex-1 mb-5">
        <ExpandableFeatures features={pkg.features} collapseAt={3} />
      </div>

      {/* CTA */}
      <a
        href={getWhatsAppUrl("package", pkg.name)}
        target="_blank"
        rel="noopener noreferrer"
        className={["w-full justify-center text-xs sm:text-sm py-2.5 sm:py-3", pkg.isPopular ? btn.whatsapp : btn.secondary].join(" ")}
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
      className="relative bg-[#FAFAF8] py-20 lg:py-28"
      aria-labelledby="packages-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-10 lg:mb-12">
          <p className="text-[10px] sm:text-xs font-semibold text-[#888888] tracking-[0.25em] uppercase mb-3"
            style={{ fontFamily: "var(--font-heading)" }}>
            {packages.length} Paket Tersedia
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-6">
            <h2
              id="packages-heading"
              className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Pilih Paket Foto
            </h2>
            <p className="text-[#5A5A5A] text-xs sm:text-sm max-w-xs leading-relaxed flex-shrink-0">
              Semua paket sudah termasuk editing profesional dan file resolusi tinggi.
            </p>
          </div>
        </div>

        {/* Cards — 1 kolom di mobile kecil, 2 di sm, 3 di lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {previewPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/packages"
            className={`group ${btn.secondary} rounded-full px-8 py-3.5 text-sm`}
          >
            Lihat Semua Paket
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
