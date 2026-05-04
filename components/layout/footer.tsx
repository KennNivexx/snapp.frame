// components/layout/footer.tsx
// Footer: Logo + tagline kiri | Link navigasi tengah | Sosmed kanan | Copyright bawah
// Fase B: dark footer (#1A1A1A) — kontras dengan halaman terang (disengaja)

import Link from "next/link";
import { site } from "@/data/site";
import { MapPin, Mail, Clock } from "lucide-react";
import { Logo } from "@/components/ui/logo";

/* ─── Instagram Icon (inline SVG) ─────────────────────────── */
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

/* ─── TikTok Icon ─────────────────────────────────────────── */
function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z" />
    </svg>
  );
}

/* ─── Footer Nav Links ─────────────────────────────────────── */
const FOOTER_NAV = [
  { label: "Galeri", href: "/gallery" },
  { label: "Paket & Harga", href: "/packages" },
  { label: "Tentang Kami", href: "/#about" },
  { label: "Kontak", href: "/#contact" },
];

/* ─── Component ────────────────────────────────────────────── */

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-[#1A1A1A]"
      role="contentinfo"
    >
      {/* ── Main Footer Content ───────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-10 lg:pt-20 lg:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">

          {/* ── Col 1: Logo + Tagline ──────────────────────── */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded mb-6"
              aria-label="Snappeachy Studio — Beranda"
            >
              <Logo height={40} textColor="#F5F5F5" />
            </Link>

            <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-xs">
              {site.tagline}
            </p>
            <p className="text-xs text-[#6B6B6B] leading-relaxed max-w-xs">
              {site.subTagline}
            </p>

            {/* Contact quick-info */}
            <div className="flex flex-col gap-2.5 mt-1">
              <div className="flex items-start gap-2.5 text-xs text-[#6B6B6B]">
                <MapPin size={14} className="text-[#6B6B6B] mt-0.5 flex-shrink-0" />
                <span>{site.contact.address}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#6B6B6B]">
                <Mail size={14} className="text-[#6B6B6B] flex-shrink-0" />
                <a
                  href={`mailto:${site.contact.email}`}
                  className="hover:text-[#F5F5F5] transition-colors duration-200"
                >
                  {site.contact.email}
                </a>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#6B6B6B]">
                <Clock size={14} className="text-[#6B6B6B] mt-0.5 flex-shrink-0" />
                <div>
                  {site.operatingHours.map((oh) => (
                    <div key={oh.day}>
                      <span className="text-[#888888]">{oh.day}</span>{" "}
                      <span>{oh.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Col 2: Navigation Links ───────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Heading kolom: muted, bukan gold */}
            <h3 className="text-xs font-semibold text-[#888888] tracking-widest uppercase">
              Navigasi
            </h3>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B6B6B] hover:text-[#F5F5F5] transition-colors duration-200 group flex items-center gap-2"
                  >
                    {/* Underline animasi — putih bukan gold */}
                    <span className="w-0 h-px bg-[#F5F5F5] group-hover:w-4 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Sosial Media ───────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Heading kolom: muted, bukan gold */}
            <h3 className="text-xs font-semibold text-[#888888] tracking-widest uppercase">
              Ikuti Kami
            </h3>

            <div className="flex flex-col gap-3">
              {/* Instagram */}
              <a
                href={site.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Snappeachy Studio"
                className="flex items-center gap-3 group"
              >
                {/* Sosmed icon container — hapus hover gold */}
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-[#6B6B6B] group-hover:text-[#F5F5F5] group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-200">
                  <InstagramIcon size={16} />
                </span>
                <span className="text-sm text-[#6B6B6B] group-hover:text-[#F5F5F5] transition-colors duration-200">
                  @snappeachystudio
                </span>
              </a>

              {/* TikTok */}
              <a
                href={site.contact.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Snappeachy Studio"
                className="flex items-center gap-3 group"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-[#6B6B6B] group-hover:text-[#F5F5F5] group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-200">
                  <TikTokIcon size={16} />
                </span>
                <span className="text-sm text-[#6B6B6B] group-hover:text-[#F5F5F5] transition-colors duration-200">
                  @snappeachystudio
                </span>
              </a>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Studio foto minimalis untuk semua momen spesial Anda.
              </p>
              {/* Gold accent line DIHAPUS */}
            </div>
          </div>
        </div>
      </div>

      {/* ── Copyright Bar ─────────────────────────────────── */}
      <div className="border-t border-white/5">
        {/* max-w konsisten dengan footer content di atas */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-[#6B6B6B] text-center">
            © {currentYear} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
