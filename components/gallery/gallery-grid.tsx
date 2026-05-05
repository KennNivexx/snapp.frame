"use client";

// components/gallery/gallery-grid.tsx
// Client component — filter, masonry, lightbox dengan desain yang hangat dan estetik

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Expand } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { Photo, PhotoCategory } from "@/data/photos";

/* ─── Filter tabs ─────────────────────────────────────────── */

const FILTERS: { label: string; value: PhotoCategory | "all"; emoji: string }[] = [
  { label: "Semua", value: "all", emoji: "✦" },
  { label: "Solo", value: "solo", emoji: "①" },
  { label: "Couple", value: "couple", emoji: "②" },
  { label: "Family", value: "family", emoji: "③" },
  { label: "Birthday", value: "birthday", emoji: "④" },
  { label: "Graduation", value: "graduation", emoji: "⑤" },
];

/* ─── Photo Card ──────────────────────────────────────────── */

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
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="relative overflow-hidden rounded-2xl cursor-pointer group break-inside-avoid mb-3 md:mb-4"
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
        className="object-cover"
        style={{
          filter: hovered ? "brightness(0.68) saturate(1.1)" : "brightness(0.97)",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          transition: "filter 0.4s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
        }}
      />

      {/* Gradient dasar — selalu ada sedikit untuk kedalaman */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
        style={{ opacity: hovered ? 1 : 0.35, transition: "opacity 0.4s ease" }}
      />

      {/* Expand icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.7 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <Expand size={17} color="#1A1A1A" />
        </div>
      </motion.div>

      {/* Nomor kecil editorial di pojok kiri atas */}
      <div
        className="absolute top-3 left-3 transition-opacity duration-300"
        style={{ opacity: hovered ? 0 : 1 }}
      >
        <span
          className="text-[10px] font-semibold text-white/50 tracking-widest"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Category badge + alt text saat hover */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-4"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <span className="inline-block text-[9px] font-bold tracking-[0.2em] uppercase bg-white/20 backdrop-blur-sm text-white/80 px-2.5 py-1 rounded-full mb-2">
          {photo.category}
        </span>
        <p className="text-xs text-white/90 leading-snug line-clamp-2">
          {photo.alt}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── GalleryGrid Component ──────────────────────────────── */

interface GalleryGridProps {
  photos: Photo[];
}

export function GalleryGrid({ photos }: GalleryGridProps) {
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
    () => filtered.map((p) => ({ src: p.src, alt: p.alt, width: p.width, height: p.height })),
    [filtered]
  );

  const openLightbox = useCallback((i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  }, []);

  return (
    <>
      {/* ── Filter Tabs ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-10">
        <div
          className="flex gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
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
                "flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-250 min-h-[44px]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]",
                "font-[family-name:var(--font-heading)]",
                activeFilter === f.value
                  ? "bg-[#1A1A1A] text-white shadow-md"
                  : "bg-white/70 border border-[#E0E0DA] text-[#888888] hover:border-[#1A1A1A] hover:text-[#1A1A1A] hover:bg-white",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Jumlah foto */}
        <p className="text-xs text-[#888888] mt-4">
          Menampilkan{" "}
          <span className="text-[#1A1A1A] font-semibold">{filtered.length}</span>{" "}
          foto
          {activeFilter !== "all" && (
            <> · kategori <span className="text-[#5A5A5A] capitalize italic">{activeFilter}</span></>
          )}
        </p>
      </div>

      {/* ── Masonry Grid ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-28">
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#F0EFE9] flex items-center justify-center mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#CCCCCC]">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21,15 16,10 5,21" />
                </svg>
              </div>
              <p
                className="text-lg font-semibold text-[#1A1A1A] mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Belum ada foto di kategori ini
              </p>
              <p className="text-sm text-[#888888] mb-5">
                Coba pilih kategori lain untuk melihat koleksi kami.
              </p>
              <button
                onClick={() => setActiveFilter("all")}
                className="text-sm font-semibold text-[#1A1A1A] border border-[#1A1A1A] rounded-full px-6 py-2.5 hover:bg-[#1A1A1A] hover:text-white transition-all duration-200"
              >
                Lihat semua foto
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
