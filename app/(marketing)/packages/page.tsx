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
import { getProducts } from "@/app/actions/products";
import { Check } from "lucide-react";

// sortedPackages moved into component

/* ─── Package Card ───────────────────────────────────────── */

function PackageCard({ pkg }: { pkg: (typeof packages)[0] }) {
  return (
    <div
      className={[
        "relative flex flex-col rounded-[2rem] border transition-all duration-500 h-full group overflow-hidden",
        pkg.isPopular
          ? "border-gold/30 bg-white shadow-[0_20px_50px_rgba(93,64,55,0.08)] ring-1 ring-gold/10"
          : "border-border/60 bg-white/50 hover:bg-white hover:border-near-black/20 hover:shadow-[0_10px_30px_rgba(93,64,55,0.05)]",
      ].join(" ")}
    >
      {/* Decorative Gradient Background for Popular */}
      {pkg.isPopular && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold/10 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
      )}

      {/* Badge Terpopuler */}
      {pkg.isPopular && (
        <div className="absolute top-6 right-6">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] bg-near-black text-white uppercase rounded-full shadow-lg shadow-near-black/20 transform-gpu transition-transform group-hover:scale-105">
            ★ Terpopuler
          </span>
        </div>
      )}

      <div className="p-8 sm:p-10 flex flex-col h-full relative z-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-black tracking-[0.2em] text-gold uppercase mb-3">
            {pkg.duration} • {pkg.photoCount}
          </p>
          <h2
            className="text-2xl sm:text-3xl font-black text-near-black mb-4 leading-tight group-hover:text-black transition-colors"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {pkg.name}
          </h2>
          <div className="flex items-baseline gap-2">
            <span
              className="text-3xl sm:text-5xl font-black text-near-black tracking-tighter"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {formatPrice(pkg.price)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-12 bg-near-black/10 mb-8 transition-all duration-500 group-hover:w-full group-hover:bg-near-black/5" />

        {/* Features list with custom icons */}
        <div className="flex-1 mb-10">
          <div className="space-y-4">
            {pkg.features.slice(0, 5).map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-sm text-dark-gray"
              >
                <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-gold/10 flex items-center justify-center">
                  <Check size={10} className="text-gold" />
                </div>
                <span className="leading-relaxed font-bold">{feature}</span>
              </div>
            ))}
            {pkg.features.length > 5 && (
              <p className="text-[10px] text-muted pl-7 font-black uppercase tracking-wider">
                + {pkg.features.length - 5} fitur lainnya
              </p>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <a
            href={`/booking?pkg=${pkg.id}`}
            className={[
              btn.primary,
              "w-full rounded-xl py-4 overflow-hidden group font-black uppercase tracking-widest text-[11px]",
            ].join(" ")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer" />
            <CalendarCheck
              size={18}
              className="transition-transform group-hover:rotate-12"
            />
            Pesan Sekarang
          </a>

          <a
            href={getWhatsAppUrl("package", pkg.name)}
            target="_blank"
            rel="noopener noreferrer"
            className={[btn.secondary, "w-full rounded-xl py-3.5 font-black uppercase tracking-widest text-[11px]"].join(" ")}
          >
            <MessageCircle size={16} />
            Tanya via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */

export default async function PackagesPage() {
  const productsRes = await getProducts();
  const dbPackages = productsRes.success ? productsRes.data : [];

  // Ensure we have a valid array even if fetch fails
  const displayPackages =
    dbPackages && dbPackages.length > 0 ? dbPackages : packages;

  // Sort and handle potential nullish sortOrder
  const sortedPackages = [...(displayPackages || [])].sort(
    (a, b) => ((a as any).sortOrder || 0) - ((b as any).sortOrder || 0),
  );

  return (
    <main className="min-h-screen bg-white">
      {/* ── Premium Packages Header ── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-near-black/5 bg-warm-white/30">
        {/* Subtle Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-gold)_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.03]" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.3em] text-gold uppercase">
              Pricing & Packages
            </span>
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-near-black mb-8 leading-[1.1] tracking-tighter"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Investasi Untuk <br />
            <span className="text-gold italic underline decoration-gold/30 underline-offset-8">Kenangan Indah</span>
          </h1>

          <p className="text-near-black/60 text-lg font-bold max-w-2xl mx-auto leading-relaxed mb-12">
            Kami percaya setiap momen layak mendapatkan kualitas terbaik. Pilih
            paket yang paling sesuai dengan kebutuhan cerita Anda hari ini.
          </p>

          {/* Value Props Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
            {[
              { label: "High Res", sub: "Crystal Clear" },
              { label: "Pro Edit", sub: "Natural Look" },
              { label: "Fast Work", sub: "2-3 Days" },
              { label: "All Files", sub: "Google Drive" },
            ].map((prop, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-sm font-black text-near-black mb-0.5">
                  {prop.label}
                </span>
                <span className="text-[10px] text-near-black/40 font-black uppercase tracking-widest">
                  {prop.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packages Grid — 2 kolom ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-20 lg:pt-32 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {sortedPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg as any} />
          ))}
        </div>
      </div>

      {/* ── FAQ Section ── */}
      <div className="bg-warm-white/20 border-t border-near-black/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto">
            {/* FAQ Header */}
            <div className="text-center mb-12">
              <p className="text-[10px] font-black tracking-[0.3em] text-gold uppercase mb-4">
                FAQ
              </p>
              <h2
                className="text-3xl sm:text-4xl font-black text-near-black"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Pertanyaan <span className="text-gold">Umum</span>
              </h2>
              <p className="text-near-black/60 font-bold text-sm mt-3">
                Tidak menemukan jawaban yang dicari? Hubungi kami via WhatsApp.
              </p>
            </div>

            {/* FAQ Accordion — client component */}
            <FaqAccordion faqs={faqs} />
          </div>
        </div>
      </div>

      {/* ── Bottom CTA Banner ── */}
      <div className="bg-white border-t border-near-black/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-20">
          {/* Container — warm light, tanpa gold glow */}
          <div className="rounded-[3rem] border border-near-black/5 bg-warm-white/30 px-8 py-12 lg:px-16 lg:py-16 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-near-black mb-3 relative z-10"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Masih ada pertanyaan?
            </h2>
            <p className="text-near-black/60 font-bold text-sm mb-8 max-w-md mx-auto relative z-10">
              Tim kami siap membantu Anda menemukan paket yang tepat dan
              merencanakan sesi foto yang berkesan.
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
