// app/gallery/page.tsx — Server Component
// Data foto di-fetch saat build time (lebih baik untuk SEO)
// Semua interaktivitas ada di GalleryGrid (client component)

import { photos } from "@/data/photos";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      {/* ── Page Header ── */}
      <div className="pt-32 pb-12 lg:pt-40 lg:pb-16
                      max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <p className="text-xs font-medium tracking-[0.15em] text-[#888888]
                       uppercase mb-4">
          Portofolio
        </p>
        <h1
          className="text-4xl sm:text-5xl font-semibold text-[#1A1A1A] mb-4"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Galeri Foto
        </h1>
        <p className="text-[#5A5A5A] text-base max-w-lg">
          Setiap foto adalah cerita. Jelajahi koleksi karya terbaik kami dari berbagai
          sesi — solo, couple, keluarga, ulang tahun, hingga wisuda.
        </p>
      </div>

      {/* ── Gallery — interaktif, client component ── */}
      <GalleryGrid photos={photos} />
    </main>
  );
}
