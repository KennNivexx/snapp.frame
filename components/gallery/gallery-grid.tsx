"use client";

// components/gallery/gallery-grid.tsx
// Client component untuk interaktivitas galeri: filter, lightbox, animasi
// Menerima photos sebagai props dari Server Component (app/gallery/page.tsx)

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Expand } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { Photo, PhotoCategory } from "@/data/photos";

/* ─── Filter tabs ────────────────────────────────────────── */

const FILTERS: { label: string; value: PhotoCategory | "all" }[] = [
  { label: "Semua", value: "all" },
  { label: "Solo", value: "solo" },
  { label: "Couple", value: "couple" },
  { label: "Family", value: "family" },
  { label: "Birthday", value: "birthday" },
  { label: "Graduation", value: "graduation" },
];

/* ─── Photo Card ─────────────────────────────────────────── */

function PhotoCard({
  photo,
  index,
  onOpen,
}: {
  photo: Photo;
  index: number;
  onOpen: (i: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isPortrait = photo.width / photo.height < 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="relative overflow-hidden rounded-xl cursor-pointer group break-inside-avoid mb-3 md:mb-4"
      style={{ aspectRatio: isPortrait ? "3/4" : "4/3" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(index);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Buka foto: ${photo.alt}`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        style={{
          filter: hovered ? "brightness(0.7)" : "brightness(1)",
          transition: "filter 0.35s ease, transform 0.7s ease",
        }}
      />

      {/* Overlay gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-350"
        style={{ opacity: hovered ? 1 : 0.3 }}
      />

      {/* Expand icon — bg putih bukan gold */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.7 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
          <Expand size={18} color="#1A1A1A" />
        </div>
      </motion.div>

      {/* Category badge — bg putih bukan black/gold */}
      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-[10px] font-medium tracking-widest uppercase bg-white/90 text-[#1A1A1A] px-2.5 py-1 rounded-full backdrop-blur-sm">
          {photo.category}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── GalleryGrid Component ──────────────────────────────── */

interface GalleryGridProps {
  photos: Photo[];
}

export function GalleryGrid({ photos }: GalleryGridProps) {
  // "all" hanya digunakan sebagai kondisi filter di UI, bukan sebagai PhotoCategory
  const [activeFilter, setActiveFilter] = useState<PhotoCategory | "all">("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? photos
        : photos.filter((p) => p.category === activeFilter),
    [photos, activeFilter]
  );

  const slides = useMemo(
    () =>
      filtered.map((p) => ({ src: p.src, alt: p.alt, width: p.width, height: p.height })),
    [filtered]
  );

  const openLightbox = useCallback((i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  }, []);

  return (
    <>
      {/* ── Filter Tabs ── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 mb-10">
        <div
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          role="tablist"
          aria-label="Filter kategori foto"
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={activeFilter === f.value}
              onClick={() => setActiveFilter(f.value)}
              className={[
                "flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-200 min-h-[44px]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]",
                activeFilter === f.value
                  ? "bg-[#1A1A1A] text-[#FAFAF8]"
                  : "bg-white border border-[#E0E0DA] text-[#5A5A5A] hover:border-[#1A1A1A] hover:text-[#1A1A1A]",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Photo Count ── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 mb-6">
        <p className="text-xs text-[#888888]">
          Menampilkan{" "}
          <span className="text-[#1A1A1A] font-medium">{filtered.length}</span>{" "}
          foto
          {activeFilter !== "all" && (
            <> · kategori <span className="text-[#5A5A5A] capitalize">{activeFilter}</span></>
          )}
        </p>
      </div>

      {/* ── Masonry Grid ── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pb-24">
        {filtered.length > 0 ? (
          /* Tanpa AnimatePresence mode="wait" — tidak ada flash kosong */
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="columns-2 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 md:gap-4"
          >
            {filtered.map((photo, i) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={i}
                onOpen={openLightbox}
              />
            ))}
          </motion.div>
        ) : (
          /* Empty State — ikon foto yang relevan + tombol reset filter */
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-[#CCCCCC] mb-4"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
            <p
              className="text-lg font-medium text-[#1A1A1A] mt-4"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Belum ada foto di kategori ini
            </p>
            <p className="text-sm text-[#888888] mt-1">
              Coba pilih kategori lain atau lihat semua foto.
            </p>
            <button
              onClick={() => setActiveFilter("all")}
              className="mt-3 text-sm text-[#5A5A5A] underline hover:text-[#1A1A1A] transition-colors"
            >
              Lihat semua foto
            </button>
          </motion.div>
        )}
      </div>

      {/* ── Lightbox ── */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={lightboxIndex}
        styles={{ container: { backgroundColor: "rgba(10,10,10,0.97)" } }}
      />
    </>
  );
}
