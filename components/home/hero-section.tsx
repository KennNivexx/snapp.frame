"use client";

// components/home/hero-section.tsx
// Hero editorial 2-kolom — teks kiri, foto kanan
// Fase B: warm minimal, tanpa dark background, tanpa gold glow, tanpa grid lines

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { photos } from "@/data/photos";
import { site } from "@/data/site";
import { btn } from "@/lib/button-classes";

/* ─── Animation Variants ────────────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ─── Component ─────────────────────────────────────────── */

export function HeroSection() {
  const heroPhoto = photos.find((p) => p.isHero);

  return (
    <section
      id="hero"
      className="relative min-h-svh overflow-hidden"
      aria-label="Hero — Snappeachy Studio"
    >
      {/* Layout: teks kiri + foto kanan (editorial 2-kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-svh">

        {/* ── Kolom Kiri: Teks ── */}
        <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20
                        pt-28 pb-16 lg:pt-0 lg:pb-0 bg-[#FAFAF8] relative z-10">
          <motion.div
            className="max-w-lg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Label kecil — sederhana, tanpa garis gold */}
            <motion.p
              variants={fadeUpVariants}
              className="text-xs font-medium tracking-[0.15em] text-[#888888]
                         uppercase mb-8"
            >
              Photobooth Studio · Minimalis Modern
            </motion.p>

            {/* Heading — tanpa WebkitTextStroke, tanpa span gold */}
            <motion.h1
              variants={fadeUpVariants}
              className="text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-semibold
                         leading-[1.05] tracking-tight text-[#1A1A1A] mb-6"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Foto yang
              <br />
              terasa{" "}
              <em className="font-normal not-italic" style={{ fontStyle: "italic" }}>
                berbeda.
              </em>
            </motion.h1>

            {/* Sub-heading */}
            <motion.p
              variants={fadeUpVariants}
              className="text-[#5A5A5A] text-base lg:text-lg leading-relaxed mb-10"
            >
              {site.heroDescription ?? site.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUpVariants}
              className="flex flex-col sm:flex-row gap-3"
            >
              {/* Primer: ke galeri */}
              <Link
                href="/gallery"
                className={`group ${btn.primary}`}
              >
                Lihat Galeri
                <ArrowRight size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              {/* Sekunder: ke halaman paket */}
              <Link
                href="/packages"
                className={btn.secondary}
              >
                Lihat Paket
              </Link>
            </motion.div>

            {/* Stats — tanpa gold, near-black */}
            <motion.div
              variants={fadeUpVariants}
              className="mt-12 pt-8 border-t border-[#E0E0DA]
                         flex items-center gap-8 sm:gap-10"
            >
              {[
                { value: site.stats.sessions, label: "Sesi selesai" },
                { value: site.stats.rating, label: "Rating Google" },
                { value: site.stats.yearsActive + " tahun", label: "Pengalaman" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-0.5">
                  <span
                    className="text-2xl font-semibold text-[#1A1A1A]"
                    style={{ fontFamily: "var(--font-syne)" }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-xs text-[#888888]">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* ── Kolom Kanan: Foto ── */}
        <div className="relative bg-[#E8E8E4] min-h-[50vw] lg:min-h-0">
          {heroPhoto ? (
            <Image
              src={heroPhoto.src}
              alt={heroPhoto.alt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            /* Placeholder jika belum ada foto hero */
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[#AAAAAA] text-sm">Foto hero belum tersedia</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
