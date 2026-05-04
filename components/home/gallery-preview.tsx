"use client";

// components/home/gallery-preview.tsx
// Masonry grid 6 foto featured + lightbox + CTA "Lihat Semua Foto"
// Fase B: warm light background, no gold accents

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Expand, ArrowRight } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { photos } from "@/data/photos";
import type { Photo } from "@/data/photos";
import { btn } from "@/lib/button-classes";

/* ─── Data: ambil featured, max 9, sort by sortOrder ─────── */

const featuredPhotos: Photo[] = photos
  .filter((p) => p.isFeatured)
  .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
  .slice(0, 9);

/* ─── Animation Variants ────────────────────────────────── */

const sectionVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ─── Photo Card ─────────────────────────────────────────── */

interface PhotoCardProps {
  photo: Photo;
  index: number;
  onOpen: (index: number) => void;
}

function PhotoCard({ photo, index, onOpen }: PhotoCardProps) {
  const [hovered, setHovered] = useState(false);

  const aspectRatio = photo.width / photo.height;
  const isPortrait = aspectRatio < 1;

  return (
    <motion.div
      variants={cardVariants}
      className={`relative overflow-hidden rounded-xl cursor-pointer group ${
        isPortrait ? "row-span-2" : "row-span-1"
      }`}
      style={{
        aspectRatio: isPortrait ? "3/4" : "4/3",
        breakInside: "avoid",
        marginBottom: "16px",
        display: "inline-block",
        width: "100%",
      }}
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
      aria-label={`Lihat foto: ${photo.alt}`}
    >
      {/* Foto */}
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        style={{
          filter: hovered ? "brightness(0.75)" : "brightness(1)",
          transition: "filter 0.35s ease, transform 0.7s ease",
        }}
        onError={(e) => {
          const img = e.currentTarget;
          img.style.display = "none";
          const parent = img.parentElement;
          if (parent) {
            parent.style.background =
              "linear-gradient(135deg, #E8E8E4 0%, #D8D8D4 100%)";
          }
        }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-350"
        style={{ opacity: hovered ? 1 : 0.4 }}
      />

      {/* Expand icon di tengah saat hover — bg putih bukan gold */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
          <Expand size={18} color="#1A1A1A" />
        </div>
      </motion.div>

      {/* Caption kecil di bawah */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-3 transition-opacity duration-300"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <p className="text-xs text-white/90 leading-snug line-clamp-2">
          {photo.alt}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Main Section ───────────────────────────────────────── */

export function GalleryPreview() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const slides = featuredPhotos.map((p) => ({
    src: p.src,
    alt: p.alt,
    width: p.width,
    height: p.height,
  }));

  return (
    <section
      id="gallery-preview"
      className="relative bg-[#F0EFE9] py-24 lg:py-32 overflow-hidden"
      aria-labelledby="gallery-preview-heading"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* ── Section Header ── */}
        <motion.div
          className="mb-14 lg:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          {/* Eyebrow dihapus — langsung heading */}
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h2
              id="gallery-preview-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Karya Terbaik Kami
            </h2>
            <p className="text-[#5A5A5A] text-sm max-w-xs lg:max-w-sm leading-relaxed">
              Setiap foto adalah cerita. Kami mengabadikan momen Anda dengan
              sentuhan estetik minimalis yang timeless.
            </p>
          </div>
        </motion.div>

        {/* ── Masonry Grid (CSS columns) ── */}
        {featuredPhotos.length > 0 ? (
          <motion.div
            className="columns-1 sm:columns-2 lg:columns-3 gap-4"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {featuredPhotos.map((photo, i) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={i}
                onOpen={openLightbox}
              />
            ))}
          </motion.div>
        ) : (
          /* Skeleton placeholder */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-[#E0E0DA] animate-pulse"
                style={{ aspectRatio: i % 3 === 0 ? "3/4" : "4/3" }}
              />
            ))}
          </div>
        )}

        {/* ── CTA Bawah — border hitam, bukan gold ── */}
        <motion.div
          className="mt-14 lg:mt-16 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link
            href="/gallery"
            className={`group ${btn.secondary} rounded-full px-10 py-4`}
          >
            Lihat Semua Foto
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>

      {/* ── Lightbox ── */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={lightboxIndex}
        styles={{
          container: { backgroundColor: "rgba(10,10,10,0.96)" },
        }}
      />
    </section>
  );
}
