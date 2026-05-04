"use client";

// components/layout/navbar.tsx
// Sticky navbar: transparan di hero → solid setelah scroll 80px
// Desktop: menu horizontal | Mobile: hamburger → Sheet slide dari kiri

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

/* ─── Nav Links ────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Galeri", href: "/gallery" },
  { label: "Paket", href: "/packages" },
  { label: "Tentang", href: "/#about" },
  { label: "Kontak", href: "/#contact" },
] as const;

/* ─── Component ────────────────────────────────────────────── */

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Track scroll position
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 80);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Set initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return pathname === href;
  };

  // Determine if we are on a transparent navbar over a dark hero section
  const isDarkBg = pathname === "/" && !scrolled;
  const headerTextColor = isDarkBg ? "text-white" : "text-[#1A1A1A]";

  return (
    <>
      {/* ── Navbar Bar ─────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${headerTextColor}`}>
        {/* Animated background overlay — terpisah dari elemen interaktif */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            backgroundColor: scrolled
              ? "rgba(250, 250, 248, 0.97)"
              : "rgba(250, 250, 248, 0)",
            backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
            boxShadow: scrolled
              ? "0 1px 0 0 rgba(26, 26, 26, 0.08)"
              : "none",
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          aria-hidden="true"
        />

        {/* Nav content di atas overlay, pointer-events tetap normal */}
        <nav className="relative max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-20 xl:px-28">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* ── Logo ─────────────────────────────────────── */}
            <Link
              href="/"
              className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-current rounded"
              aria-label="Snappeachy Studio — Beranda"
            >
              <Logo height={34} textColor="currentColor" />
            </Link>

            {/* ── Desktop Menu ─────────────────────────────── */}
            <ul className="hidden lg:flex items-center gap-8" role="menubar">
              {NAV_LINKS.map((link) => (
                <li key={link.href} role="none">
                  <Link
                    href={link.href}
                    role="menuitem"
                    className={[
                      "relative text-xs font-bold tracking-[0.15em] uppercase transition-colors duration-200",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-current rounded-sm",
                      "font-[family-name:var(--font-montserrat)]",
                      isActive(link.href)
                        ? "text-current border-b-2 border-current pb-0.5"
                        : "text-current/70 hover:text-current",
                      "group",
                    ].join(" ")}
                  >
                    {link.label}
                    {/* Animated underline */}
                    {!isActive(link.href) && (
                      <span
                        className="absolute -bottom-1 left-0 h-px bg-current w-0 group-hover:w-full transition-all duration-300 ease-out"
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* ── Mobile Hamburger ─────────────────────────── */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen((prev) => !prev)}
              onTouchStart={(e) => {
                e.preventDefault();
                setMobileOpen((prev) => !prev);
              }}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md text-current hover:bg-current/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={22} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu size={22} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile Menu — Full-screen Overlay ──────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-in Sheet dari kiri */}
            <motion.nav
              id="mobile-nav"
              key="mobile-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Menu navigasi mobile"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-[#FAFAF8] border-r border-[#E0E0DA] lg:hidden flex flex-col"
            >
              {/* Sheet Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E0E0DA]">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Snappeachy Studio — Beranda"
                >
                  <Logo height={28} />
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-[#888888] hover:text-[#1A1A1A] hover:bg-black/5 transition-all duration-200 focus:outline-none"
                  aria-label="Tutup menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Sheet Nav Links */}
              <ul className="flex-1 px-4 py-6 space-y-1" role="menu">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    role="none"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 + 0.1, duration: 0.25 }}
                  >
                    <Link
                      href={link.href}
                      role="menuitem"
                      onClick={() => setMobileOpen(false)}
                      className={[
                        "flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-bold tracking-[0.1em] uppercase",
                        "font-[family-name:var(--font-montserrat)]",
                        "transition-all duration-200 min-h-[48px]",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]",
                        isActive(link.href)
                          ? "text-[#1A1A1A] bg-black/5"
                          : "text-[#1A1A1A] hover:text-[#2C2C2C] hover:bg-black/5",
                      ].join(" ")}
                    >
                      {isActive(link.href) && (
                        <span className="w-1 h-4 bg-[#1A1A1A] rounded-full flex-shrink-0" />
                      )}
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              {/* Sheet Footer */}
              <div className="px-6 py-5 border-t border-[#E0E0DA]">
                <p className="text-xs text-[#888888]">
                  © 2025 Snappeachy Studio
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
