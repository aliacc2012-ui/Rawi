"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function Nav() {
  const { dict, locale, setLocale } = useLocale();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 flex h-[72px] items-center justify-between gap-3 transition-all duration-300 ${
        scrolled ? "glass-nav" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-[min(1180px,calc(100%-24px))] sm:w-[min(1180px,calc(100%-40px))] items-center justify-between gap-3">
        <Link href="#top" aria-label="RAWI home" className="flex min-w-0 items-center gap-2 font-extrabold">
          <span className="grid h-[30px] w-[30px] shrink-0 -rotate-[8deg] place-items-center rounded-[50%_50%_50%_8px] bg-rawi-yellow text-sm font-black text-black">
            R
          </span>
          <span className="text-[18px] font-extrabold tracking-[0.1em] text-[#F0EFFF] sm:text-[20px]">RAWI</span>
          <span className="font-arabic text-xs text-white/35">راوي</span>
        </Link>

        <nav className="hidden gap-8 md:flex" aria-label="Primary navigation">
          <a href="#features" className="font-montserrat text-[12px] font-medium tracking-[0.08em] text-white/50 transition-colors hover:text-[#C9962A]">{dict.nav.features}</a>
          <a href="#gallery" className="font-montserrat text-[12px] font-medium tracking-[0.08em] text-white/50 transition-colors hover:text-[#C9962A]">{dict.nav.gallery}</a>
          <a href="#pricing" className="font-montserrat text-[12px] font-medium tracking-[0.08em] text-white/50 transition-colors hover:text-[#C9962A]">{dict.nav.pricing}</a>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.03em] sm:text-[13px] sm:tracking-[0.04em]" aria-label="Language selector">
            <button
              type="button"
              onClick={() => setLocale("ar")}
              aria-pressed={locale === "ar"}
              className={`font-montserrat transition-colors ${locale === "ar" ? "text-[#C9962A]" : "text-white/35 hover:text-white/70"}`}
            >
              AR
            </button>
            <span className="font-medium text-white/20">/</span>
            <button
              type="button"
              onClick={() => setLocale("en")}
              aria-pressed={locale === "en"}
              className={`font-montserrat transition-colors ${locale === "en" ? "text-[#C9962A]" : "text-white/35 hover:text-white/70"}`}
            >
              ENG
            </button>
          </div>
          <Link
            href="/login"
            className="btn-shimmer btn-glow inline-flex items-center rounded-full px-3 py-[9px] text-xs font-extrabold text-black shadow-[0_8px_24px_rgba(255,212,0,0.22)] hover:-translate-y-px transition-transform sm:px-[15px] sm:py-[10px] sm:text-sm"
          >
            {dict.nav.open}
          </Link>
        </div>
      </div>
    </header>
  );
}
