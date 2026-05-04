"use client";

// components/home/testimonials-section.tsx
// Section 5 — Testimoni: carousel mobile + grid desktop
// Fase B: warm light background, white cards, gold only for star ratings

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { testimonials } from "@/data/testimonials";

const MAX = 9;
const displayed = testimonials.slice(0, MAX);

/* ─── Star Rating ────────────────────────────────────────── */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          fill={i < rating ? "#C9A84C" : "transparent"}
          stroke={i < rating ? "#C9A84C" : "#D0CFC9"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

/* ─── Testimonial Card ───────────────────────────────────── */

function TestimonialCard({ t }: { t: (typeof displayed)[0] }) {
  return (
    <div className="flex flex-col h-full bg-white border border-[#E0E0DA] rounded-2xl p-6 hover:border-[#C0C0BB] transition-colors duration-300">
      {/* Quote mark — muted, tidak gold */}
      <span
        className="text-4xl leading-none text-[#E0E0DA] mb-3 select-none"
        aria-hidden="true"
      >
        &ldquo;
      </span>

      <p className="flex-1 text-sm text-[#3A3A3A] leading-relaxed mb-5 line-clamp-5">
        {t.text}
      </p>

      {/* Footer card */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E8E8E4]">
        {/* Avatar + nama */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#F0EFE9] border border-[#E0E0DA] flex items-center justify-center flex-shrink-0">
            <span
              className="text-xs font-bold text-[#888888]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#1A1A1A] leading-tight">
              {t.name}
            </p>
            {t.sessionType && (
              <p className="text-[11px] text-[#888888]">
                {t.sessionType}
                {t.date ? ` · ${t.date}` : ""}
              </p>
            )}
          </div>
        </div>
        {/* Star rating — gold BOLEH di sini */}
        <StarRating rating={t.rating} />
      </div>
    </div>
  );
}

/* ─── Main Section ───────────────────────────────────────── */

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent((c) => (c - 1 + displayed.length) % displayed.length);
  const next = () => setCurrent((c) => (c + 1) % displayed.length);

  return (
    <section
      id="testimonials"
      className="relative bg-[#F0EFE9] py-24 lg:py-32"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          className="mb-12 lg:mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          {/* Counter ulasan — bukan eyebrow standar */}
          <p className="text-sm font-medium text-[#888888] mb-4">
            {displayed.length}+ ulasan dari klien nyata
          </p>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Apa Kata Pelanggan Kami
          </h2>
        </motion.div>

        {/* ── Desktop: Grid 3 kolom ── */}
        <motion.div
          className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {displayed.map((t) => (
            <motion.div
              key={t.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
                },
              }}
            >
              <TestimonialCard t={t} />
            </motion.div>
          ))}
        </motion.div>

        {/* ── Mobile: Carousel satu card ── */}
        <div className="md:hidden">
          <div className="relative overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <TestimonialCard t={displayed[current]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-[#E0E0DA] flex items-center justify-center text-[#5A5A5A] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all"
              aria-label="Testimoni sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {displayed.slice(0, 6).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 bg-[#1A1A1A]"
                      : "w-1.5 bg-[#D0CFC9] hover:bg-[#888888]"
                  }`}
                  aria-label={`Testimoni ${i + 1}`}
                />
              ))}
              {displayed.length > 6 && (
                <span className="text-[10px] text-[#6B6B6B] px-1">
                  +{displayed.length - 6}
                </span>
              )}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-[#E0E0DA] flex items-center justify-center text-[#5A5A5A] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all"
              aria-label="Testimoni berikutnya"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
