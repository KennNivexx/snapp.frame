// app/gallery/page.tsx — Server Component

import { photos } from "@/data/photos";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      {/* ── Page Header ── */}
      <div className="pt-36 pb-14 lg:pt-44 lg:pb-16 bg-[#F0EFE9] relative overflow-hidden">
        {/* Dekoratif teks besar */}
        <div className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none overflow-hidden select-none">
          <span
            className="text-[18vw] font-black text-[#1A1A1A]/[0.04] leading-none whitespace-nowrap"
            style={{ fontFamily: "var(--font-heading)" }}
            aria-hidden="true"
          >
            FOTO
          </span>
        </div>

        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <p
            className="text-[10px] font-semibold tracking-[0.3em] text-[#888888] uppercase mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Portfolio
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-5 leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Galeri Foto
          </h1>
          <p className="text-[#5A5A5A] text-base max-w-lg leading-relaxed">
            Setiap foto adalah cerita. Jelajahi koleksi karya terbaik kami dari berbagai
            sesi — solo, couple, keluarga, ulang tahun, hingga wisuda.
          </p>
        </div>
      </div>

      {/* Divider tipis */}
      <div className="h-px bg-[#E0E0DA]" />

      {/* ── Gallery Grid ── */}
      <div className="pt-12">
        <GalleryGrid photos={photos} />
      </div>
    </main>
  );
}
