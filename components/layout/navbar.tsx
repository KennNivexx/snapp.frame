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
  { label: "Kasir", href: "/kasir", isHidden: true },
] as const;

/* ─── Component ────────────────────────────────────────────── */

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Track scroll — berubah saat melewati batas bawah hero
  const handleScroll = useCallback(() => {
    const heroBottom = window.innerHeight - 100;
    setScrolled(window.scrollY > heroBottom);
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

  // Remove URL hash after initial load to prevent refresh jumps
  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }, 100);
    }
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (mobileOpen) {
      root.style.overflow = "hidden";
      body.style.overflow = "hidden";
      // Prevent touch move on iOS
      body.style.touchAction = "none";
    } else {
      root.style.overflow = "";
      body.style.overflow = "";
      body.style.touchAction = "";
    }
    return () => {
      root.style.overflow = "";
      body.style.overflow = "";
      body.style.touchAction = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return pathname === href;
  };

  // Transparan di hero, solid saat scroll — Selalu hitam sesuai permintaan
  const headerTextColor = "text-[#3B2211]";

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    // If clicking a hash link on the home page, scroll smoothly without updating the URL hash
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const targetId = href.substring(2);
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMobileOpen(false);
  };

  // Hide navbar on POS routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/kasir")) {
    return null;
  }

  return (
    <>
      {/* ── Navbar Bar ─────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${headerTextColor}`}>
        {/* Gradient overlay — visible saat di hero */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(252,246,240,0.95) 0%, rgba(252,246,240,0.4) 100%)",
          }}
          animate={{
            opacity: scrolled ? 0 : 1,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          aria-hidden="true"
        />
        {/* Solid overlay — visible saat scroll */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: "rgba(252, 246, 240, 0.97)",
          }}
          animate={{
            opacity: scrolled ? 1 : 0,
            backdropFilter: scrolled ? "blur(14px)" : "blur(0px)",
            boxShadow: scrolled ? "0 1px 12px 0 rgba(59, 34, 17, 0.1)" : "0 0 0 0 transparent",
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          aria-hidden="true"
        />

        {/* Nav content di atas overlay, pointer-events tetap normal */}
        <nav className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="flex items-center justify-between h-20 lg:h-28">
            {/* ── Logo (desktop only) ─────────────────────── */}
            <Link
              href="/"
              onClick={(e) => handleNavClick(e, "/")}
              className="hidden lg:block flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-current rounded"
              aria-label="Snapp.frame Studio — Beranda"
            >
              <Logo height={300} textColor="currentColor" />
            </Link>

            {/* ── Desktop Menu ─────────────────────────────── */}
            <ul className="hidden lg:flex items-center gap-8" role="menubar">
              {NAV_LINKS.map((link) => (
                <li key={link.href} role="none">
                  <Link
                    href={link.href}
                    role="menuitem"
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={[
                      "relative text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-current rounded-sm",
                      "font-[family-name:var(--font-heading)]",
                      link.isHidden 
                        ? "opacity-0 hover:opacity-100 !text-black" 
                        : isActive(link.href)
                          ? "text-current border-b-2 border-current pb-0.5"
                          : "text-current/70 hover:text-current",
                      "group",
                    ].join(" ")}
                  >
                    {link.label}
                    {/* Animated underline */}
                    {!isActive(link.href) && (
                      <span className="absolute -bottom-1 left-0 h-px bg-current w-0 group-hover:w-full transition-all duration-300 ease-out" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* ── Mobile Hamburger ─────────────────────────── */}
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileOpen((prev) => !prev);
              }}
              className="lg:hidden flex items-center justify-center w-12 h-12 rounded-full text-current hover:bg-current/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-current relative z-[60] cursor-pointer pointer-events-auto"
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
                    className="flex items-center justify-center"
                  >
                    <X size={24} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-center"
                  >
                    <Menu size={24} />
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
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
        {mobileOpen && (
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
            className="fixed top-0 left-0 bottom-0 z-[70] w-72 max-w-[85vw] bg-[#FAFAF8] border-r border-[#E0E0DA] lg:hidden flex flex-col shadow-2xl"
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E0E0DA]">
              <Link
                href="/"
                onClick={(e) => handleNavClick(e, "/")}
                aria-label="Snapp.frame Studio — Beranda"
              >
                <Logo height={120} />
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
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={[
                      "flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-bold tracking-[0.1em] uppercase",
                      "font-[family-name:var(--font-heading)]",
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
                © 2025 Snapp.frame Studio
              </p>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
