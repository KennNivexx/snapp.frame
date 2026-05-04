"use client";

// components/home/hero-section.tsx
// Full-screen background image with centered text and button

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { photos } from "@/data/photos";

/* ─── Animation Variants ────────────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ─── Component ─────────────────────────────────────────── */

export function HeroSection() {
  // Use the hero photo, or fallback to the first photo if not found
  const heroPhoto = photos.find((p) => p.isHero) || photos[0];

  return (
    <section
      id="hero"
      className="relative min-h-svh flex flex-col items-center justify-center overflow-hidden"
      aria-label="Hero — Snapp.frame Studio"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {heroPhoto ? (
          <>
            <Image
              src={heroPhoto.src}
              alt={heroPhoto.alt || "Studio Background"}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
              quality={90}
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#1A1A1A]" />
        )}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center px-6 sm:px-10 text-center mt-16 w-full max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={fadeUpVariants}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-bold text-white mb-10 tracking-[0.1em] leading-[1.3] uppercase"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Simpan Kenangan
          <br />
          Terbaikmu Selamanya
        </motion.h1>

        <motion.div variants={fadeUpVariants}>
          <Link
            href="/packages"
            className="inline-flex items-center justify-center px-10 py-4 text-sm font-bold tracking-[0.15em] uppercase transition-all duration-300 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 shadow-lg"
          >
            Jelajahi
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
