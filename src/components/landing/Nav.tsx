"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { motion, AnimatePresence } from "framer-motion";

export function Nav() {
  const { dict, locale, setLocale } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navLinks = [
    { href: "#features", label: dict.nav.features },
    { href: "#gallery",  label: dict.nav.gallery  },
    { href: "#pricing",  label: dict.nav.pricing  },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 flex h-[72px] items-center justify-between gap-3 transition-all duration-300 ${
          scrolled ? "glass-nav" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex w-[min(1180px,calc(100%-24px))] sm:w-[min(1180px,calc(100%-40px))] items-center justify-between gap-3">
          {/* Logo */}
          <Link href="#top" aria-label="RAWI home" className="flex min-w-0 items-center gap-2 font-extrabold">
            <motion.span
              className="rawi-logo-r grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[50%_50%_50%_8px] bg-rawi-yellow text-sm font-black text-black select-none"
              style={{ rotate: -8, transformStyle: "preserve-3d" }}
              initial={{ y: -18, opacity: 0, scale: 0.65 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 17, delay: 0.12 }}
              whileHover={{ rotateY: 360, scale: 1.22, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] } }}
            >
              R
            </motion.span>
            <span className="text-[18px] font-extrabold tracking-[0.1em] text-[#F0EFFF] sm:text-[20px]">RAWI</span>
            <span className="font-arabic text-xs text-white/35">راوي</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden gap-8 md:flex" aria-label="Primary navigation">
            {navLinks.map(({ href, label }) => (
              <a key={href} href={href} className="font-montserrat text-[12px] font-medium tracking-[0.08em] text-white/50 transition-colors hover:text-[#C9962A]">
                {label}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Language */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.03em] sm:text-[13px] sm:tracking-[0.04em]" aria-label="Language selector">
              <button type="button" onClick={() => setLocale("ar")} aria-pressed={locale === "ar"}
                className={`font-montserrat transition-colors ${locale === "ar" ? "text-[#C9962A]" : "text-white/35 hover:text-white/70"}`}>AR</button>
              <span className="font-medium text-white/20">/</span>
              <button type="button" onClick={() => setLocale("en")} aria-pressed={locale === "en"}
                className={`font-montserrat transition-colors ${locale === "en" ? "text-[#C9962A]" : "text-white/35 hover:text-white/70"}`}>ENG</button>
            </div>

            {/* Open RAWI — hidden on mobile when menu is open to avoid clutter */}
            <Link href="/login"
              className="btn-shimmer btn-glow inline-flex items-center rounded-full px-3 py-[9px] text-xs font-extrabold text-black shadow-[0_8px_24px_rgba(255,212,0,0.22)] hover:-translate-y-px transition-transform sm:px-[15px] sm:py-[10px] sm:text-sm">
              {dict.nav.open}
            </Link>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex flex-col justify-center items-center gap-[5px] w-9 h-9 rounded-lg bg-white/[.06] border border-white/[.08] shrink-0"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <span className={`block w-4 h-[1.5px] bg-white/70 rounded-full transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
              <span className={`block w-4 h-[1.5px] bg-white/70 rounded-full transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-4 h-[1.5px] bg-white/70 rounded-full transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Menu panel */}
            <motion.nav
              key="drawer"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed top-[72px] inset-x-0 z-50 md:hidden bg-[#0d0d18]/95 backdrop-blur-xl border-b border-white/[.07] px-6 py-5 flex flex-col gap-1"
              aria-label="Mobile navigation"
            >
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3.5 text-base font-semibold text-white/60 hover:text-white border-b border-white/[.06] last:border-0 transition-colors"
                >
                  {label}
                </a>
              ))}
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="mt-3 w-full text-center rounded-full bg-rawi-yellow px-5 py-3 text-sm font-extrabold text-black"
              >
                Start for free
              </Link>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
